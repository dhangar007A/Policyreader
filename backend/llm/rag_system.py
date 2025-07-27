from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_ollama import OllamaLLM
from document_processor import DocumentProcessor, DocumentChunk
from vector_store import VectorStore
import json
from datetime import datetime

class QueryResponse(BaseModel):
    """Structured response for query results."""
    answer: str = Field(description="The main answer to the query")
    confidence: float = Field(description="Confidence score (0-1)")
    sources: List[str] = Field(description="List of source documents used")
    reasoning: str = Field(description="Explanation of how the answer was derived")
    relevant_clauses: List[str] = Field(description="Relevant clauses or sections found")
    domain: str = Field(description="Domain classification (insurance, legal, hr, compliance)")
    timestamp: str = Field(description="Timestamp of the response")

class IntelligentQuerySystem:
    """Main RAG system for intelligent query processing."""
    
    def __init__(self, llm_model: str = "deepseek-r1:latest"):
        self.llm = OllamaLLM(model=llm_model)
        self.document_processor = DocumentProcessor()
        self.vector_store = VectorStore()
        self.parser = PydanticOutputParser(pydantic_object=QueryResponse)
        
        # Define the RAG prompt template
        self.prompt_template = ChatPromptTemplate.from_template("""
            You are an expert AI assistant specializing in insurance, legal, HR, and compliance domains. 
            Your task is to answer queries based on the provided document context.

            ## Context:
            The following documents have been retrieved based on the user's query:
            {documents}

            ## User Query:
            {query}

            ## Instructions:
            1. Analyze the provided documents carefully
            2. Extract relevant information that directly addresses the query
            3. If the documents don't contain sufficient information, state this clearly
            4. Provide specific references to document sections when possible
            5. Classify the domain (insurance, legal, hr, compliance)
            6. Explain your reasoning process

            ## Response Format:
            Provide a structured response with:
            - Clear, concise answer
            - Confidence level (0-1)
            - Source documents used
            - Reasoning process
            - Relevant clauses/sections
            - Domain classification

            ## Response:
        """)
        
        self.chain = self.prompt_template | self.llm | self.parser
    
    def add_documents(self, directory_path: str):
        """Process and add documents to the system."""
        print(f"Processing documents from: {directory_path}")
        
        # Process documents
        chunks = self.document_processor.process_directory(directory_path)
        print(f"Processed {len(chunks)} document chunks")
        
        # Add to vector store
        self.vector_store.add_documents(chunks)
        print("Documents added to vector store")
    
    def query(self, user_query: str, top_k: int = 5, threshold: float = 0.3) -> QueryResponse:
        """Process a user query and return structured response."""
        
        # Perform semantic search
        relevant_chunks = self.vector_store.semantic_search(
            user_query, 
            k=top_k, 
            threshold=threshold
        )
        
        if not relevant_chunks:
            return QueryResponse(
                answer="No relevant documents found to answer your query.",
                confidence=0.0,
                sources=[],
                reasoning="No documents matched the query criteria.",
                relevant_clauses=[],
                domain="unknown",
                timestamp=datetime.now().isoformat()
            )
        
        # Prepare context from retrieved chunks
        context = self._prepare_context(relevant_chunks)
        
        # Generate response using LLM
        try:
            response = self.chain.invoke({
                "documents": context,
                "query": user_query
            })
            return response
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return QueryResponse(
                answer="Error processing your query. Please try again.",
                confidence=0.0,
                sources=[chunk.source for chunk in relevant_chunks],
                reasoning=f"Error occurred during response generation: {str(e)}",
                relevant_clauses=[],
                domain="unknown",
                timestamp=datetime.now().isoformat()
            )
    
    def _prepare_context(self, chunks: List[DocumentChunk]) -> str:
        """Prepare context string from document chunks."""
        context_parts = []
        
        for i, chunk in enumerate(chunks):
            context_part = f"""
                Document {i+1}: {chunk.source}{'='*50}
                Content: {chunk.content}
            """
            if chunk.page_number:
                context_part += f"Page: {chunk.page_number}\n"
            if chunk.section:
                context_part += f"Section: {chunk.section}\n"
            if chunk.metadata:
                context_part += f"Metadata: {json.dumps(chunk.metadata, indent=2)}\n"
            
            context_parts.append(context_part)
        
        return "\n".join(context_parts)
    
    def save_system(self, filepath: str):
        """Save the entire system state."""
        self.vector_store.save(filepath)
        print(f"System saved to: {filepath}")
    
    def load_system(self, filepath: str):
        """Load the system state."""
        self.vector_store.load(filepath)
        print(f"System loaded from: {filepath}")
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics."""
        return {
            "vector_store": self.vector_store.get_statistics(),
            "llm_model": self.llm.model,
            "document_processor": {
                "chunk_size": self.document_processor.chunk_size,
                "chunk_overlap": self.document_processor.chunk_overlap
            }
        }
    
    def batch_query(self, queries: List[str]) -> List[QueryResponse]:
        """Process multiple queries in batch."""
        responses = []
        for query in queries:
            response = self.query(query)
            responses.append(response)
        return responses 