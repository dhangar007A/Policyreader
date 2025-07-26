const express = require("express");
const cors = require("cors");

const app = express();

// CORS for all origins
app.use(cors({
  origin: "*",
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));


app.use(express.json());

// API metadata
const metadata = {
  app_name: "Backend-API",
  description: "Backend for Bajaj HackRx 6.0",
  version: "0.1.0"
};

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    app_name: metadata.app_name,
    version: metadata.version
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
