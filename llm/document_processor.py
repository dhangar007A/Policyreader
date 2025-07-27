import os
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
import PyPDF2
from docx import Document
import email
from email import policy
from email.parser import BytesParser
import tiktoken
from dataclasses import dataclass
from datetime import datetime

@dataclass
class DocumentChunk:
    """Represents a chunk of text from a document with metadata."""
    content: str
    source: str
    chunk_id: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentProcessor:
    """Handles processing of PDF, DOCX, and email documents."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def process_pdf(self, file_path: str) -> List[DocumentChunk]:
        """Extract text from PDF file and chunk it."""
        chunks = []
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text.strip():
                        page_chunks = self._chunk_text(
                            text, 
                            f"{Path(file_path).stem}_page_{page_num + 1}",
                            page_num + 1
                        )
                        chunks.extend(page_chunks)
                        
        except Exception as e:
            print(f"Error processing PDF {file_path}: {e}")
            
        return chunks
    
    def process_docx(self, file_path: str) -> List[DocumentChunk]:
        """Extract text from DOCX file and chunk it."""
        chunks = []
        try:
            doc = Document(file_path)
            full_text = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    full_text.append(paragraph.text)
            
            text = '\n'.join(full_text)
            if text.strip():
                chunks = self._chunk_text(
                    text, 
                    f"{Path(file_path).stem}",
                    section="document"
                )
                
        except Exception as e:
            print(f"Error processing DOCX {file_path}: {e}")
            
        return chunks
    
    def process_email(self, file_path: str) -> List[DocumentChunk]:
        """Extract text from email file and chunk it."""
        chunks = []
        try:
            with open(file_path, 'rb') as file:
                msg = BytesParser(policy=policy.default).parse(file)
            
            # Extract email components
            subject = msg.get('subject', 'No Subject')
            sender = msg.get('from', 'Unknown Sender')
            date = msg.get('date', 'Unknown Date')
            
            # Get email body
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body = part.get_content()
                        break
            else:
                body = msg.get_content()
            
            # Create metadata
            metadata = {
                'subject': subject,
                'sender': sender,
                'date': date,
                'type': 'email'
            }
            
            if body.strip():
                chunks = self._chunk_text(
                    body, 
                    f"{Path(file_path).stem}",
                    section="email",
                    metadata=metadata
                )
                
        except Exception as e:
            print(f"Error processing email {file_path}: {e}")
            
        return chunks
    
    def _chunk_text(self, text: str, source: str, page_number: Optional[int] = None, 
                    section: Optional[str] = None, metadata: Optional[Dict] = None) -> List[DocumentChunk]:
        """Split text into overlapping chunks."""
        chunks = []
        
        # Tokenize text
        tokens = self.tokenizer.encode(text)
        
        # Create chunks with overlap
        for i in range(0, len(tokens), self.chunk_size - self.chunk_overlap):
            chunk_tokens = tokens[i:i + self.chunk_size]
            chunk_text = self.tokenizer.decode(chunk_tokens)
            
            if chunk_text.strip():
                chunk = DocumentChunk(
                    content=chunk_text,
                    source=source,
                    chunk_id=f"{source}_chunk_{i//self.chunk_size}",
                    page_number=page_number,
                    section=section,
                    timestamp=datetime.now(),
                    metadata=metadata or {}
                )
                chunks.append(chunk)
        
        return chunks
    
    def process_directory(self, directory_path: str) -> List[DocumentChunk]:
        """Process all supported documents in a directory."""
        all_chunks = []
        directory = Path(directory_path)
        
        # Process PDFs
        for pdf_file in directory.glob("*.pdf"):
            chunks = self.process_pdf(str(pdf_file))
            all_chunks.extend(chunks)
        
        # Process DOCX files
        for docx_file in directory.glob("*.docx"):
            chunks = self.process_docx(str(docx_file))
            all_chunks.extend(chunks)
        
        # Process email files
        for email_file in directory.glob("*.eml"):
            chunks = self.process_email(str(email_file))
            all_chunks.extend(chunks)
        
        return all_chunks
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
        return text.strip() 