"""
Document processing service for handling file operations and text extraction
"""

import os
import logging
from typing import Tuple, Dict, Any
from pathlib import Path
import mimetypes
import tempfile

from fastapi import UploadFile
import fitz  # PyMuPDF
from PIL import Image
import pytesseract

# Configure logger
logger = logging.getLogger(__name__)

def is_pdf_file(filename: str) -> bool:
    """Check if file is a PDF based on extension and mime type"""
    mime_type, _ = mimetypes.guess_type(filename)
    return (
        filename.lower().endswith('.pdf') or
        (mime_type and mime_type == 'application/pdf')
    )

def is_image_file(filename: str) -> bool:
    """Check if file is an image based on extension and mime type"""
    mime_type, _ = mimetypes.guess_type(filename)
    return (
        any(filename.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']) or
        (mime_type and mime_type.startswith('image/'))
    )

async def save_uploaded_file(file: UploadFile, destination: Path) -> Path:
    """
    Save uploaded file to destination
    
    Args:
        file: Uploaded file
        destination: Path to save file to
        
    Returns:
        Path to saved file
    """
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Read uploaded file in chunks
            chunk_size = 1024 * 1024  # 1MB chunks
            while chunk := await file.read(chunk_size):
                temp_file.write(chunk)
                
        # Move temp file to destination
        os.rename(temp_file.name, destination)
        return destination
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file' in locals():
            cleanup_temp_file(temp_file.name)
        raise Exception(f"Error saving uploaded file: {str(e)}")

def cleanup_temp_file(file_path: Path) -> None:
    """
    Clean up temporary file
    
    Args:
        file_path: Path to file to clean up
    """
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
    except Exception as e:
        logger.error(f"Error cleaning up temporary file {file_path}: {str(e)}")

async def extract_text_from_pdf(file_path: Path, force_ocr: bool = False) -> Tuple[str, Dict[str, Any]]:
    """
    Extract text from PDF file
    
    Args:
        file_path: Path to PDF file
        force_ocr: Whether to force OCR even if text is extractable
        
    Returns:
        Tuple of (extracted text, metadata)
    """
    try:
        doc = fitz.open(file_path)
        
        text_content = []
        used_ocr = False
        total_words = 0
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Try normal text extraction first
            page_text = page.get_text() if not force_ocr else ""
            
            # If no text found or force_ocr is True, try OCR
            if not page_text.strip() or force_ocr:
                # Convert page to image
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
                # Perform OCR
                page_text = pytesseract.image_to_string(img)
                used_ocr = True
                
            text_content.append(page_text)
            total_words += len(page_text.split())
        
        return "\n\n".join(text_content), {
            "page_count": len(doc),
            "word_count": total_words,
            "ocr_used": used_ocr
        }
        
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

async def extract_text_from_image(file_path: Path) -> Tuple[str, Dict[str, Any]]:
    """
    Extract text from image file using OCR
    
    Args:
        file_path: Path to image file
        
    Returns:
        Tuple of (extracted text, metadata)
    """
    try:
        # Open image
        with Image.open(file_path) as img:
            # Perform OCR
            text_content = pytesseract.image_to_string(img)
            
            return text_content, {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "word_count": len(text_content.split()),
                "ocr_used": True
            }
            
    except Exception as e:
        raise Exception(f"Error extracting text from image: {str(e)}")

async def extract_text_from_file(file_path: Path, force_ocr: bool = False) -> Tuple[str, Dict[str, Any]]:
    """
    Extract text from file (PDF or image)
    
    Args:
        file_path: Path to file
        force_ocr: Whether to force OCR for PDFs
        
    Returns:
        Tuple of (extracted text, metadata)
    """
    try:
        if is_pdf_file(str(file_path)):
            return await extract_text_from_pdf(file_path, force_ocr)
            
        elif is_image_file(str(file_path)):
            return await extract_text_from_image(file_path)
            
        else:
            raise ValueError("Unsupported file type")
            
    except Exception as e:
        raise Exception(f"Error extracting text from file: {str(e)}") 