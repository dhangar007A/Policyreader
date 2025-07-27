from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import shutil
from pathlib import Path
from rag_system import IntelligentQuerySystem, QueryResponse
import json

app = FastAPI(
    title="Intelligent Query-Retrieval System",
    description="LLM-Powered system for processing documents and answering queries in insurance, legal, HR, and compliance domains",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RAG system
rag_system = IntelligentQuerySystem()

# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Also create the parent uploads directory for the LLM system
PARENT_UPLOAD_DIR = Path("../uploads")
PARENT_UPLOAD_DIR.mkdir(exist_ok=True)

print("Loading existing documents...")
try:
    # Check both upload directories
    documents_loaded = False
    
    if UPLOAD_DIR.exists() and any(UPLOAD_DIR.iterdir()):
        rag_system.add_documents(str(UPLOAD_DIR))
        print("Existing documents loaded from llm/uploads successfully")
        documents_loaded = True
    
    if PARENT_UPLOAD_DIR.exists() and any(PARENT_UPLOAD_DIR.iterdir()):
        rag_system.add_documents(str(PARENT_UPLOAD_DIR))
        print("Existing documents loaded from ../uploads successfully")
        documents_loaded = True
    
    if not documents_loaded:
        print("No existing documents found in upload directories")
except Exception as e:
    print(f"Error loading existing documents: {e}")

class QueryRequest(BaseModel):
    """Request model for queries."""
    query: str
    top_k: Optional[int] = 5
    threshold: Optional[float] = 0.3

class BatchQueryRequest(BaseModel):
    """Request model for batch queries."""
    queries: List[str]
    top_k: Optional[int] = 5
    threshold: Optional[float] = 0.3

class SystemStats(BaseModel):
    """System statistics response."""
    vector_store: dict
    llm_model: str
    document_processor: dict

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Intelligent Query-Retrieval System API",
        "version": "1.0.0",
        "endpoints": {
            "upload_documents": "POST /upload",
            "query": "POST /query",
            "batch_query": "POST /batch-query",
            "stats": "GET /stats",
            "health": "GET /health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "system": "Intelligent Query-Retrieval System"}

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process documents."""
    try:
        # Save uploaded files
        saved_files = []
        for file in files:
            if file.filename:
                # Save to both directories to ensure compatibility
                file_path_llm = UPLOAD_DIR / file.filename
                file_path_parent = PARENT_UPLOAD_DIR / file.filename
                
                # Save to llm/uploads
                with open(file_path_llm, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                # Copy to parent uploads directory
                shutil.copy2(file_path_llm, file_path_parent)
                
                saved_files.append(str(file_path_llm))
        
        # Process documents from both directories
        rag_system.add_documents(str(UPLOAD_DIR))
        rag_system.add_documents(str(PARENT_UPLOAD_DIR))
        
        return {
            "message": f"Successfully processed {len(saved_files)} documents",
            "files": saved_files,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing documents: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Process a single query."""
    try:
        print(f"Processing query: {request.query}")
        response = rag_system.query(
            request.query,
            top_k=request.top_k,
            threshold=request.threshold
        )
        print(f"Query processed successfully")
        return response
        
    except Exception as e:
        print(f"Error processing query: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/batch-query")
async def batch_query_documents(request: BatchQueryRequest):
    """Process multiple queries in batch."""
    try:
        responses = []
        for query in request.queries:
            response = rag_system.query(
                query,
                top_k=request.top_k,
                threshold=request.threshold
            )
            responses.append(response.dict())
        
        return {
            "responses": responses,
            "total_queries": len(request.queries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing batch queries: {str(e)}")

@app.post("/load-documents")
async def load_documents():
    """Manually trigger document loading from uploads directory."""
    try:
        print("Manually loading documents...")
        rag_system.add_documents(str(UPLOAD_DIR))
        
        # Get updated stats
        stats = rag_system.get_system_stats()
        
        return {
            "message": "Documents loaded successfully",
            "status": "success",
            "stats": stats
        }
        
    except Exception as e:
        print(f"Error loading documents: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error loading documents: {str(e)}")

@app.get("/stats", response_model=SystemStats)
async def get_system_stats():
    """Get system statistics."""
    try:
        stats = rag_system.get_system_stats()
        return SystemStats(**stats)
        
    except Exception as e:
        print(f"Error getting system stats: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting system stats: {str(e)}")

@app.post("/save")
async def save_system(filepath: str = "system_backup"):
    """Save the system state."""
    try:
        rag_system.save_system(filepath)
        return {"message": f"System saved to {filepath}", "status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving system: {str(e)}")

@app.post("/load")
async def load_system(filepath: str = "system_backup"):
    """Load the system state."""
    try:
        rag_system.load_system(filepath)
        return {"message": f"System loaded from {filepath}", "status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading system: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 