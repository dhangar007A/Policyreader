// server.js
// This script initializes an Express server that acts as a gateway. It receives chat requests
// from a client application, handles file uploads, and forwards the data to a backend AI service for processing.

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const redis = require('./redisClient');
const {v4 : uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// =================================================================
// SECTION: Middleware Configuration
// =================================================================

// Enables Cross-Origin Resource Sharing (CORS) to allow requests from different origins.
app.use(cors());

// Configures middleware to parse incoming JSON request bodies.
app.use(express.json());
// Configures middleware to parse incoming URL-encoded request bodies.
app.use(express.urlencoded({ extended: true }));


// =================================================================
// SECTION: File Upload Handling (Multer)
// =================================================================

// Configures Multer's disk storage engine.
const storage = multer.diskStorage({
  // Specifies the destination directory for temporarily storing uploaded files.
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    // Ensures the 'uploads/' directory exists, creating it if necessary.
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  // Defines the file naming convention to prevent collisions by prepending a timestamp.
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// =================================================================
// SECTION: API Routes
// =================================================================

/**
 * @route   GET api/chat/initiate
 * @desc    Initializes a new chat session.
 * @access  Public
 */
app.get('/api/chat/initiate', async (req, res) => {
  console.log('Chat session initiated.');
  const session_id = `session_${uuidv4()}`;
  console.log(session_id);
  const sessionData = {
    created_at: Date.now(),
    lastActive: Date.now(),
    messages: [],
  };

  try {
    await redis.set(session_id, JSON.stringify(sessionData), {
      EX: 1800 // 30 minutes
    });

    res.status(200).json({
      message: 'Chat session successfully initiated.',
      sessionId: session_id,
    });
  } catch (error) {
    console.error('Redis error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * @route   POST /chat/send
 * @desc    Receives a chat message, optionally with a file, forwards it
 * to the AI service, and returns the AI's response.
 * @access  Public
 */
// The `upload.single('document')` middleware intercepts the request to handle
// a single file upload from the 'document' form field.
app.post('/chat/send', upload.single('document'), async (req, res) => {
  try {
    const { chat: chatMessage } = req.body;
    const file = req.file;

    console.log(`Received chat message: "${chatMessage}"`);
    if (file) {
      console.log(`Received file: ${file.originalname} (saved as ${file.filename})`);
    }

    // --- AI Service Communication ---

    // Constructs a new FormData payload for the request to the AI service.
    const formData = new FormData();
    formData.append('chat', chatMessage);

    // If a file is present in the request, it is read as a stream and appended to the FormData.
    if (file) {
      formData.append('document', fs.createReadStream(file.path));
    }

    // Defines the endpoint for the external AI processing service.
    const aiServiceUrl = 'http://localhost:4000/process';

    console.log('Forwarding request to AI service...');

    // Forwards the composed FormData to the AI service via an Axios POST request.
    const aiResponse = await axios.post(aiServiceUrl, formData, {
      headers: {
        // Essential for setting the 'Content-Type' header to 'multipart/form-data' with the correct boundary.
        ...formData.getHeaders()
      }
    });

    console.log('Received response from AI service.');

    // --- Response and Cleanup ---

    // Removes the temporary file from local storage after successful processing.
    if (file) {
      fs.unlinkSync(file.path);
      console.log(`Deleted temporary file: ${file.filename}`);
    }

    // Relays the response from the AI service back to the original client.
    res.status(200).json(aiResponse.data);

  } catch (error) {
    console.error('An error occurred in /chat/send:', error.message);

    // Provides detailed error logging for different failure scenarios.
    if (error.response) {
      // Handles errors where the AI service responded with a non-2xx status code.
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
    } else if (error.request) {
      // Handles network errors or cases where the AI service is unreachable.
      console.error('Error Request:', 'The AI service may be down or unreachable.');
    } else {
      // Catches other errors that occurred during the request setup.
      console.error('Error Message:', error.message);
    }

    res.status(500).json({
      error: 'Failed to communicate with the AI service.'
    });
  }
});

// =================================================================
// SECTION: Server Initialization
// =================================================================

app.listen(port, () => {
  console.log(`Express chat server listening at http://localhost:${port}`);
});