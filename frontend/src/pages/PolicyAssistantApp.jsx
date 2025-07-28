import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Shield, FileText, Zap, Upload, Send, Paperclip, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PolicyAssistantApp = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const initiateSession = async () => {
      try{
        const response = await fetch("http://localhost:3000/api/chat/initiate");
        if(!response.ok){
          throw new Error(`server error: ${response.status}`);
        }

        const data = await response.json();

        if(data.sessionId){
          setSessionId(data.sessionId);
          localStorage.setItem('sessionId', data.sessionId);
        }else{
          throw new Error("NO session id returned from server");
        }
      }catch(err){
        console.log('session inititaion failed:', err);
        setError("Failed to start session. Please try again later.");
      }
    };

    initiateSession();
    console.log(localStorage.getItem("sessionId"));
  }, []);

  const handleFileUpload = async (file) => {
    console.log(`Uploading file: "${file.name}"`);
    const formData = new FormData();
    formData.append("file", file); // 'file' should match what backend expects
    formData.append("sessionId", localStorage.getItem("sessionId"))

    try {
      const response = await fetch("http://localhost:3000/upload", { //api call for file upload to backend
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload response:", data);

      // Mark document uploaded
      setDocumentsUploaded(true);
      setUploadedFiles((prev) => [...prev, file.name]);
      setResponse(null);
      setError("");
    } catch (err) {
      console.error("Upload error:", err);
      setError("File upload failed. Please try again.");
    }
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setDocumentsUploaded(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (!documentsUploaded) {
      setError('Please upload documents first before submitting a query.');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a query before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResponse = {
        decision: "Approved",
        coverage_amount: "₹5,00,000",
        confidence_score: 0.92,
        justification: "Policy covers knee surgery for members over 18. Waiting period requirements met.",
        claim_amount: "₹2,50,000",
        deductible: "₹25,000"
      };
      setResponse(mockResponse);
    } catch (err) {
      console.error("Error during query submission:", err);
      setError('An error occurred while processing your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuerySubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black font-['Inter'] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 pb-4 sm:pb-8 max-w-4xl relative z-10 min-h-screen flex flex-col overflow-x-hidden">
        <div className="text-center mb-4 sm:mb-8">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20">
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

        {response && (
          <div className="flex-1 mb-4 sm:mb-6 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">Analysis Results</h2>
                  <p className="text-slate-500 text-xs">AI-powered decision and justification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 p-3 rounded-lg border border-emerald-500/30">
                  <div className="text-emerald-400 font-semibold text-xs">Decision</div>
                  <div className="text-emerald-300 text-base font-bold break-words">{response.decision}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 p-3 rounded-lg border border-cyan-500/30">
                  <div className="text-cyan-400 font-semibold text-xs">Coverage</div>
                  <div className="text-cyan-300 text-base font-bold break-words">{response.coverage_amount}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-3 rounded-lg border border-purple-500/30">
                  <div className="text-purple-400 font-semibold text-xs">Confidence</div>
                  <div className="text-purple-300 text-base font-bold">
                    {response.confidence_score ? (response.confidence_score * 100).toFixed(0) : 'N/A'}%
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-black/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-xs font-mono">response.json</span>
                </div>
                <div className="overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-900/40 border border-red-500/40 rounded-lg">
              <p className="text-red-300 text-sm break-words">{error}</p>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center gap-2 bg-emerald-800/30 border border-emerald-500/40 px-3 py-1 rounded-lg">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-200 text-xs">
                    {fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-emerald-400 hover:text-emerald-300 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/40 p-3">
            <div className="flex items-center gap-3">
              {/* File Upload Button */}
              <div className="relative flex-shrink-0">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <button className="w-10 h-10 bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/50 hover:border-slate-500/50 rounded-xl transition-all duration-200 flex items-center justify-center">
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
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                  {query.length}/500
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleQuerySubmit}
                disabled={isLoading || !documentsUploaded || !query.trim()}
                className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                  documentsUploaded && query.trim()
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
                <span>Ready for analysis • {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAssistantApp;