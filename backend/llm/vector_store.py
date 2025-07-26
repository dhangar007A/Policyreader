import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
import pickle
import os
from document_processor import DocumentChunk

class VectorStore:
    """FAISS-based vector store for semantic search."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", dimension: int = 384):
        self.model_name = model_name
        self.dimension = dimension
        self.encoder = SentenceTransformer(model_name)
        self.index = None
        self.chunks = []
        self.metadata = []
        
    def add_documents(self, chunks: List[DocumentChunk]):
        """Add document chunks to the vector store."""
        if not chunks:
            return
            
        # Extract text content
        texts = [chunk.content for chunk in chunks]
        
        # Create embeddings
        embeddings = self.encoder.encode(texts, show_progress_bar=True)
        
        # Initialize FAISS index if not exists
        if self.index is None:
            self.index = faiss.IndexFlatIP(self.dimension)
        
        # Add to index
        self.index.add(embeddings.astype('float32'))
        
        # Store metadata
        for chunk in chunks:
            self.chunks.append(chunk)
            self.metadata.append({
                'source': chunk.source,
                'chunk_id': chunk.chunk_id,
                'page_number': chunk.page_number,
                'section': chunk.section,
                'timestamp': chunk.timestamp,
                'metadata': chunk.metadata
            })
    
    def search(self, query: str, k: int = 5) -> List[Tuple[DocumentChunk, float]]:
        """Search for similar documents."""
        if self.index is None or len(self.chunks) == 0:
            return []
        
        # Encode query
        query_embedding = self.encoder.encode([query])
        
        # Search
        scores, indices = self.index.search(query_embedding.astype('float32'), k)
        
        # Return results with scores
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.chunks):
                results.append((self.chunks[idx], float(score)))
        
        return results
    
    def semantic_search(self, query: str, k: int = 5, threshold: float = 0.3) -> List[DocumentChunk]:
        """Perform semantic search with similarity threshold."""
        results = self.search(query, k)
        
        # Filter by threshold
        filtered_results = []
        for chunk, score in results:
            if score >= threshold:
                filtered_results.append(chunk)
        
        return filtered_results
    
    def save(self, filepath: str):
        """Save the vector store to disk."""
        if self.index is not None:
            # Save FAISS index
            faiss.write_index(self.index, f"{filepath}.index")
            
            # Save metadata
            with open(f"{filepath}.metadata", 'wb') as f:
                pickle.dump({
                    'chunks': self.chunks,
                    'metadata': self.metadata,
                    'model_name': self.model_name,
                    'dimension': self.dimension
                }, f)
    
    def load(self, filepath: str):
        """Load the vector store from disk."""
        try:
            # Load FAISS index
            self.index = faiss.read_index(f"{filepath}.index")
            
            # Load metadata
            with open(f"{filepath}.metadata", 'rb') as f:
                data = pickle.load(f)
                self.chunks = data['chunks']
                self.metadata = data['metadata']
                self.model_name = data['model_name']
                self.dimension = data['dimension']
                
        except Exception as e:
            print(f"Error loading vector store: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about the vector store."""
        if self.index is None:
            return {"total_documents": 0, "index_size": 0}
        
        return {
            "total_documents": len(self.chunks),
            "index_size": self.index.ntotal,
            "dimension": self.dimension,
            "model_name": self.model_name
        } 