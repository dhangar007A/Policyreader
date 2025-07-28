import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, Bot, User, FileText, Send, Paperclip, X, AlertCircle, Home, Info, Users } from 'lucide-react';
import { apiService } from '../utils/apiService';
import { fileUploadService } from '../utils/fileUploadService';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import FileManager from '../components/common/FileManager';
import ErrorBoundary from '../components/common/ErrorBoundary';

const PolicyAssistantApp = () => {
  // ==================== STATE MANAGEMENT ====================
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // ==================== HELPER FUNCTIONS ====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = async () => {
    try {
      // TODO: Initialize session with backend
      await apiService.initializeSession(sessionId);
      console.log('Session initialized:', sessionId);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }]);
  };

  // ==================== FILE UPLOAD HANDLERS ====================
  const handleFileUpload = async (file) => {
    console.log(`📁 File upload initiated: ${file.name}`);
    
    try {
      setIsLoading(true);
      setError('');

      // Validate file before upload
      const validation = fileUploadService.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Add uploading message
      addMessage({
        type: 'system',
        content: `Uploading "${file.name}"...`,
        status: 'uploading'
      });

      // **BACKEND INTEGRATION POINT 1: FILE UPLOAD**
      // Replace this with your actual file upload API call
      const uploadResult = await fileUploadService.uploadFile(file, sessionId);
      
      if (uploadResult.success) {
        // Update uploaded files list
        setUploadedFiles(prev => [...prev, {
          id: uploadResult.fileId,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          status: 'processed'
        }]);

        // Add success message
        addMessage({
          type: 'system',
          content: `✅ Document "${file.name}" has been successfully uploaded and processed for analysis.`,
          status: 'success'
        });

      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ File upload error:', error);
      setError(`Failed to upload ${file.name}: ${error.message}`);
      
      addMessage({
        type: 'system',
        content: `❌ Failed to upload "${file.name}": ${error.message}`,
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = async (fileId) => {
    try {
      // **BACKEND INTEGRATION POINT 2: FILE DELETION**
      await apiService.deleteFile(fileId, sessionId);
      
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      
      addMessage({
        type: 'system',
        content: 'Document removed from analysis.',
        status: 'info'
      });
    } catch (error) {
      console.error('Failed to remove file:', error);
      setError('Failed to remove file');
    }
  };

  // ==================== QUERY HANDLERS ====================
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query before submitting.');
      return;
    }

    if (uploadedFiles.length === 0) {
      setError('Please upload documents first before submitting a query.');
      return;
    }

    console.log('🤖 Query submission started:', query);
    
    setIsLoading(true);
    setError('');

    // Add user message immediately
    const userMessage = {
      type: 'user',
      content: query,
      sessionId
    };
    addMessage(userMessage);

    // Clear input
    const submittedQuery = query;
    setQuery('');

    try {
      // **BACKEND INTEGRATION POINT 3: QUERY PROCESSING**
      // This is where you'll integrate with your LLM API
      const response = await apiService.processQuery({
        query: submittedQuery,
        sessionId,
        fileIds: uploadedFiles.map(f => f.id),
        context: {
          userMessage: userMessage,
          uploadedFiles: uploadedFiles
        }
      });

      // Add AI response
      addMessage({
        type: 'ai',
        content: response,
        confidence: response.confidence_score,
        sources: response.sources || []
      });

    } catch (error) {
      console.error('❌ Query processing error:', error);
      setError('Failed to process your query. Please try again.');
      
      addMessage({
        type: 'ai',
        content: {
          error: true,
          message: 'I apologize, but I encountered an error while processing your query. Please try again or contact support if the issue persists.',
          details: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black font-['Inter'] relative overflow-hidden">
        {/* Navigation Bar */}
        <nav className="relative z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Brain className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Policy Assistant
                </span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-200">
                  <Brain className="w-4 h-4" />
                  <span>Policy Assistant</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200">
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200">
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-slate-300 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 pb-4 max-w-4xl relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-3 p-2 sm:p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse" />
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-transparent via-slate-400 to-transparent"></div>
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Policy Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed px-4">
              Advanced AI-powered document analysis and intelligent policy decision-making
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/40 border border-red-500/40 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm break-words">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File Manager */}
          <FileManager 
            files={uploadedFiles}
            onRemoveFile={removeFile}
            className="mb-4"
          />

          {/* Messages Area */}
          <div className="flex-1 mb-4 overflow-hidden">
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          </div>

          {/* Chat Input */}
          <ChatInput
            query={query}
            setQuery={setQuery}
            onSubmit={handleQuerySubmit}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            documentsUploaded={uploadedFiles.length > 0}
            uploadedCount={uploadedFiles.length}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PolicyAssistantApp;