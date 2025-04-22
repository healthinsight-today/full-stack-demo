"""
Document processing routes for handling file uploads and text extraction
"""

import os
import uuid
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel, Field

from app.config import settings
from app.services.document_processor import (
    extract_text_from_file,
    is_pdf_file,
    is_image_file,
    save_uploaded_file,
    cleanup_temp_file
)

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

class ProcessedDocument(BaseModel):
    """Model for processed document response"""
    id: str = Field(..., description="Unique identifier for the document")
    filename: str = Field(..., description="Original filename")
    mimetype: str = Field(..., description="MIME type of the document")
    size_bytes: int = Field(..., description="Size of the file in bytes")
    file_path: str = Field(..., description="Path to the stored file")
    text_path: str = Field(..., description="Path to the extracted text")
    has_text: bool = Field(..., description="Whether text was successfully extracted")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class DocumentList(BaseModel):
    """Model for document list response"""
    documents: List[ProcessedDocument]
    total_count: int
    page: int
    page_size: int

@router.post("/upload", response_model=ProcessedDocument)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document file (PDF or image) and extract text.
    
    - Generates a unique document ID
    - Saves the file to the upload directory
    - Validates file type (PDF or image)
    - Extracts text using appropriate method
    - Returns document metadata with file paths
    """
    try:
        # Generate unique ID and prepare paths
        document_id = str(uuid.uuid4())
        original_filename = file.filename or "document"
        file_extension = os.path.splitext(original_filename)[1].lower()
        
        # Create directories if they don't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        text_dir = Path(settings.TEXT_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        text_dir.mkdir(parents=True, exist_ok=True)
        
        # Define file paths
        file_path = upload_dir / f"{document_id}{file_extension}"
        text_path = text_dir / f"{document_id}.txt"
        
        # Save the uploaded file
        logger.info(f"Saving uploaded file {original_filename} to {file_path}")
        saved_file_path = await save_uploaded_file(file, file_path)
        
        # Check if the file is valid (PDF or image)
        is_pdf = is_pdf_file(original_filename, str(saved_file_path))
        is_image = is_image_file(original_filename, str(saved_file_path))
        
        if not (is_pdf or is_image):
            # If invalid file type, delete it and raise an exception
            if saved_file_path.exists():
                saved_file_path.unlink()
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Only PDF and image files are accepted."
            )
        
        # Extract text from the file
        start_time = datetime.now()
        text, metadata = await extract_text_from_file(saved_file_path)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Save extracted text to text directory
        with open(text_path, "w", encoding="utf-8") as text_file:
            text_file.write(text)
        
        # Get file size
        file_size = saved_file_path.stat().st_size
        
        # Determine MIME type
        if is_pdf:
            mime_type = "application/pdf"
        elif file_extension in ['.jpg', '.jpeg']:
            mime_type = "image/jpeg"
        elif file_extension == '.png':
            mime_type = "image/png"
        elif file_extension in ['.tiff', '.tif']:
            mime_type = "image/tiff"
        else:
            mime_type = file.content_type or "application/octet-stream"
        
        # Return document metadata
        logger.info(f"Successfully processed document {document_id}")
        return ProcessedDocument(
            id=document_id,
            filename=original_filename,
            mimetype=mime_type,
            size_bytes=file_size,
            file_path=str(file_path.relative_to(Path(settings.UPLOAD_DIR).parent)),
            text_path=str(text_path.relative_to(Path(settings.TEXT_DIR).parent)),
            has_text=bool(text.strip()),
            metadata={
                "file_type": "PDF" if is_pdf else "Image",
                "word_count": metadata.get("word_count", 0),
                "char_count": metadata.get("char_count", 0),
                "page_count": metadata.get("page_count", 1),
                "ocr_used": metadata.get("ocr_used", False),
                "processing_time": processing_time,
                "extraction_duration": metadata.get("extraction_duration", 0)
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing document upload: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@router.get("/list", response_model=DocumentList)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    file_type: Optional[str] = Query(None, enum=["PDF", "Image"]),
    sort_by: str = Query("upload_date", enum=["upload_date", "filename", "file_size"]),
    sort_order: str = Query("desc", enum=["asc", "desc"])
):
    """
    List processed documents with pagination and filtering
    
    Args:
        page: Page number (1-based)
        page_size: Number of items per page
        file_type: Filter by file type (PDF/Image)
        sort_by: Field to sort by
        sort_order: Sort order (asc/desc)
    """
    try:
        # TODO: Implement database query
        # For now, return empty list
        return DocumentList(
            documents=[],
            total_count=0,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error listing documents: {str(e)}"
        )

@router.get("/{document_id}/text")
async def get_document_text(document_id: str):
    """
    Get extracted text for a document
    
    Args:
        document_id: Unique identifier of the document
    """
    try:
        text_file = Path(settings.TEXT_DIR) / f"{document_id}.txt"
        
        if not text_file.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Text not found for document {document_id}"
            )
            
        return {"text": text_file.read_text(encoding='utf-8')}
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error retrieving document text: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving document text: {str(e)}"
        )

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document and its extracted text
    
    Args:
        document_id: Unique identifier of the document
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        
        # Delete original file if it exists
        file_path = upload_dir / document_id
        if file_path.exists():
            file_path.unlink()
            
        # Delete text file if it exists
        text_file = upload_dir / f"{document_id}.txt"
        if text_file.exists():
            text_file.unlink()
            
        # TODO: Delete from database
            
        return {"status": "success", "message": f"Document {document_id} deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting document: {str(e)}"
        ) 