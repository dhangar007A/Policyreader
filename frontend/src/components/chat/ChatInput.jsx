import React from 'react';
import { Send, Paperclip } from 'lucide-react';

const ChatInput = ({ 
  query, 
  setQuery, 
  onSubmit, 
  onFileUpload, 
  isLoading, 
  documentsUploaded, 
  uploadedCount 
}) => {
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/40 p-3">
      <div className="flex items-center gap-3">
        {/* File Upload Button */}
        <div className="relative flex-shrink-0">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            disabled={isLoading}
          />
          <button 
            className="w-10 h-10 bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 hover:border-slate-500/50 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Paperclip className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about policy coverage, claims, or specific scenarios..."
            className="w-full min-h-10 max-h-32 p-3 bg-slate-800/50 border border-slate-600/30 rounded-xl resize-none transition-all duration-300 text-slate-200 text-sm placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent pr-12"
            maxLength={500}
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-slate-500">
            {query.length}/500
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={onSubmit}
          disabled={isLoading || !documentsUploaded || !query.trim()}
          className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
            documentsUploaded && query.trim() && !isLoading
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
              : 'bg-slate-700/80 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-500 text-center">
        {!documentsUploaded ? (
          <span className="text-amber-400">Upload documents to enable AI analysis</span>
        ) : (
          <span>Ready for analysis • {uploadedCount} document{uploadedCount !== 1 ? 's' : ''} uploaded</span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;