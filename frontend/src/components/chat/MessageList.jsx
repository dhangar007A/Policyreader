import React from 'react';
import { Bot, User, Upload, AlertCircle } from 'lucide-react';

const MessageList = ({ messages, isLoading, messagesEndRef }) => {
  
  /**
   * Format AI response for display
   * @param {object} response - AI response data
   * @returns {JSX.Element} - Formatted response
   */
  const formatAIResponse = (response) => {
    if (response.error) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Error Processing Query</span>
          </div>
          <p className="text-slate-300">{response.message}</p>
          {response.details && (
            <p className="text-slate-500 text-sm">Details: {response.details}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-200 leading-relaxed">
            Based on my analysis of your policy documents, here's the decision for your query:
          </p>
          
          <div className="bg-gradient-to-r from-emerald-900/20 to-green-800/20 border border-emerald-500/30 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-300 font-semibold">Decision: {response.decision}</span>
            </div>
            <p className="text-slate-300 text-sm">
              {response.justification}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
              <div className="text-cyan-400 text-xs font-semibold">Coverage Amount</div>
              <div className="text-cyan-300 text-lg font-bold">{response.coverage_amount}</div>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-400 text-xs font-semibold">Confidence Score</div>
              <div className="text-purple-300 text-lg font-bold">
                {(response.confidence_score * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400 space-y-1">
            <p><strong>Claim Amount:</strong> {response.claim_amount}</p>
            <p><strong>Deductible:</strong> {response.deductible}</p>
          </div>

          {response.sources && response.sources.length > 0 && (
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <p className="text-slate-400 text-sm font-medium mb-2">Sources:</p>
              {response.sources.map((source, index) => (
                <p key={index} className="text-slate-500 text-xs">
                  • {source.document} - Section {source.section} (Relevance: {(source.relevance * 100).toFixed(0)}%)
                </p>
              ))}
            </div>
          )}

          <p className="text-slate-400 text-sm mt-4">
            If you need more details or have additional questions about your policy coverage, feel free to ask!
          </p>
        </div>
      </div>
    );
  };

  const getMessageIcon = (type, status) => {
    if (type === 'user') return <User className="w-4 h-4 text-white" />;
    if (type === 'system') return <Upload className="w-4 h-4 text-white" />;
    return <Bot className="w-4 h-4 text-white" />;
  };

  const getMessageStyles = (type, status) => {
    if (type === 'user') {
      return 'bg-gradient-to-br from-purple-600 to-pink-600 text-white';
    }
    if (type === 'system') {
      if (status === 'error') return 'bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 text-red-200';
      if (status === 'success') return 'bg-gradient-to-br from-emerald-900/40 to-green-800/40 border border-emerald-500/30 text-emerald-200';
      return 'bg-gradient-to-br from-amber-900/40 to-orange-800/40 border border-amber-500/30 text-amber-200';
    }
    return 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/30 text-slate-200';
  };

  const getAvatarStyles = (type) => {
    if (type === 'user') return 'bg-gradient-to-br from-purple-500 to-pink-500';
    if (type === 'system') return 'bg-gradient-to-br from-amber-500 to-orange-500';
    return 'bg-gradient-to-br from-cyan-500 to-blue-500';
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-500 max-w-md mx-auto px-4">
          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Ready to assist you</p>
          <p className="text-sm">Upload your policy documents and start asking questions about coverage, claims, or specific scenarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {messages.map((message) => (
        <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getAvatarStyles(message.type)}`}>
            {getMessageIcon(message.type, message.status)}
          </div>

          {/* Message Content */}
          <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-4 rounded-2xl shadow-lg ${getMessageStyles(message.type, message.status)}`}>
              {message.type === 'ai' && typeof message.content === 'object' ? (
                formatAIResponse(message.content)
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            <div className={`text-xs text-slate-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-slate-400 text-sm ml-2">Analyzing your query...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;