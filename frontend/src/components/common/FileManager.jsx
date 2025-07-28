import React from 'react';
import { FileText, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const FileManager = ({ files, onRemoveFile, className = '' }) => {
  if (!files || files.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading': return <Clock className="w-3 h-3 text-amber-400 animate-spin" />;
      case 'processed': return <CheckCircle className="w-3 h-3 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
      default: return <FileText className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'bg-emerald-800/30 border-emerald-500/40 text-emerald-200';
      case 'uploading': return 'bg-amber-800/30 border-amber-500/40 text-amber-200';
      case 'error': return 'bg-red-800/30 border-red-500/40 text-red-200';
      default: return 'bg-slate-800/30 border-slate-500/40 text-slate-200';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {files.map((file) => (
        <div key={file.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(file.status)}`}>
          {getStatusIcon(file.status)}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate max-w-32">
              {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
            </span>
            <span className="text-xs opacity-70">
              {formatFileSize(file.size)}
            </span>
          </div>
          {file.status !== 'uploading' && (
            <button
              onClick={() => onRemoveFile(file.id)}
              className="text-current hover:opacity-70 transition-opacity"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileManager;