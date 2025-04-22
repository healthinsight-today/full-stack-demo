"""
Core document processing functionality for handling file uploads, text extraction, and OCR.
"""

import os
import logging
from typing import Tuple, Dict, Any, Optional
from pathlib import Path
import mimetypes
import magic
import time
import tempfile
import cv2
import numpy as np

from fastapi import UploadFile
from PIL import Image
import pytesseract
import PyPDF2
from pdf2image import convert_from_path

# Configure logger
logger = logging.getLogger(__name__)

def get_mime_type(file_path: str) -> str:
    """
    Get the MIME type of a file using python-magic
    
    Args:
        file_path: Path to the file
        
    Returns:
        MIME type string
    """
    try:
        return magic.from_file(file_path, mime=True)
    except Exception as e:
        logger.error(f"Error getting MIME type: {e}")
        return ""

def is_pdf_file(filename: str, file_path: Optional[str] = None) -> bool:
    """
    Check if a file is a PDF based on extension and MIME type.
    
    Args:
        filename: Name of the file
        file_path: Optional path to the file for MIME type checking
        
    Returns:
        Boolean indicating if the file is a PDF
    """
    ext = os.path.splitext(filename)[1].lower()
    
    # Check extension first
    if ext == '.pdf':
        return True
        
    # Check MIME type from filename
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type == 'application/pdf':
        return True
        
    # If file_path is provided and extension/MIME type from name is not conclusive,
    # check actual file content
    if file_path and os.path.exists(file_path):
        file_mime_type = get_mime_type(file_path)
        return file_mime_type == 'application/pdf'
        
    return False

def is_image_file(filename: str, file_path: Optional[str] = None) -> bool:
    """
    Check if a file is an image based on extension and MIME type.
    
    Args:
        filename: Name of the file
        file_path: Optional path to the file for MIME type checking
        
    Returns:
        Boolean indicating if the file is an image
    """
    image_extensions = {'.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif', '.webp'}
    ext = os.path.splitext(filename)[1].lower()
    
    # Check extension first
    if ext in image_extensions:
        return True
        
    # Check MIME type from filename
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type and mime_type.startswith('image/'):
        return True
        
    # If file_path is provided and extension/MIME type from name is not conclusive,
    # check actual file content
    if file_path and os.path.exists(file_path):
        file_mime_type = get_mime_type(file_path)
        return file_mime_type and file_mime_type.startswith('image/')
        
    return False

async def save_uploaded_file(file: UploadFile, destination: Path) -> Path:
    """Save an uploaded file to the specified destination."""
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        
        content = await file.read()
        with open(destination, 'wb') as f:
            f.write(content)
        
        # Check if the file has a proper extension, if not add it based on MIME type
        if not destination.suffix:
            mime_type = get_mime_type(str(destination))
            if mime_type == 'application/pdf':
                new_destination = destination.with_suffix('.pdf')
                destination.rename(new_destination)
                destination = new_destination
            elif mime_type.startswith('image/'):
                ext = mimetypes.guess_extension(mime_type)
                if ext:
                    new_destination = destination.with_suffix(ext)
                    destination.rename(new_destination)
                    destination = new_destination
                    
        return destination
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        raise

def cleanup_temp_file(file_path: Path):
    """Clean up a temporary file."""
    try:
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.error(f"Error cleaning up temporary file {file_path}: {e}")

async def extract_text_from_file(file_path: Path, force_ocr: bool = False) -> tuple[str, dict]:
    """
    Extract text from a file based on its type (PDF or image).
    
    Args:
        file_path: Path to the file
        force_ocr: Whether to force OCR for PDFs
        
    Returns:
        Tuple of (extracted text, metadata)
    """
    start_time = time.time()
    metadata = {
        "extraction_time": start_time,
        "ocr_used": False,
        "page_count": 1
    }
    
    try:
        if is_pdf_file(None, str(file_path)):
            logger.info(f"Extracting text from PDF: {file_path}")
            text, pdf_metadata = extract_text_from_pdf(file_path, force_ocr)
            metadata.update(pdf_metadata)
        elif is_image_file(None, str(file_path)):
            logger.info(f"Extracting text from image: {file_path}")
            text = extract_text_from_image(file_path)
            metadata["ocr_used"] = True
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
        
        # Calculate processing metrics
        metadata["extraction_duration"] = time.time() - start_time
        metadata["char_count"] = len(text)
        metadata["word_count"] = len(text.split())
        
        return text, metadata
        
    except Exception as e:
        logger.error(f"Error extracting text from file {file_path}: {str(e)}")
        return "", {"error": str(e), "extraction_duration": time.time() - start_time}


def extract_text_from_pdf(file_path: Path, force_ocr: bool = False) -> tuple[str, dict]:
    """
    Extract text from a PDF file, using OCR if necessary.
    
    Args:
        file_path: Path to the PDF file
        force_ocr: Whether to force OCR even if text can be extracted directly
        
    Returns:
        Tuple of (extracted text, metadata)
    """
    metadata = {
        "ocr_used": False,
        "page_count": 0,
        "file_type": "PDF"
    }
    
    try:
        # First try to extract text directly
        if not force_ocr:
            try:
                with open(file_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    metadata["page_count"] = len(reader.pages)
                    
                    text = ""
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n\n"
                    
                    # If we extracted a reasonable amount of text, return it
                    if len(text.strip()) > 100:
                        logger.info(f"Extracted {len(text)} characters from PDF directly")
                        return text, metadata
            except Exception as e:
                logger.warning(f"Error extracting text directly from PDF: {str(e)}")
        
        # If direct extraction failed or force_ocr=True, use OCR
        logger.info("Using OCR for PDF text extraction")
        metadata["ocr_used"] = True
        
        # Convert PDF pages to images and perform OCR
        text_from_images = ""
        images = convert_from_path(
            file_path, 
            dpi=300,  # Higher DPI for better OCR quality
            fmt="png"
        )
        
        metadata["page_count"] = len(images)
        
        # Configure Tesseract for optimal results with medical documents
        custom_config = r'--oem 3 --psm 6 -l eng+osd --dpi 300'
        
        for i, image in enumerate(images):
            # Preprocess image for better OCR results
            img_array = np.array(image)
            # Convert to grayscale
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            # Apply threshold to get black and white image
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            
            # Save preprocessed image to a temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp:
                cv2.imwrite(temp.name, thresh)
                temp_path = temp.name
            
            try:
                # Perform OCR on the processed image
                page_text = pytesseract.image_to_string(
                    Image.open(temp_path),
                    config=custom_config
                )
                text_from_images += page_text + "\n\n"
                
            finally:
                # Clean up the temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
        
        logger.info(f"Extracted {len(text_from_images)} characters from PDF using OCR")
        return text_from_images, metadata
        
    except Exception as e:
        logger.error(f"Failed to extract text from PDF {file_path}: {str(e)}")
        return "", {"error": str(e), "ocr_used": metadata["ocr_used"], "page_count": metadata["page_count"]}


def extract_text_from_image(file_path: Path) -> str:
    """
    Extract text from an image file using OCR.
    
    Args:
        file_path: Path to the image file
        
    Returns:
        Extracted text
    """
    try:
        # Read the image
        image = cv2.imread(str(file_path))
        if image is None:
            # Try using PIL if OpenCV fails
            with Image.open(file_path) as img:
                # Convert PIL Image to numpy array
                image = np.array(img)
                if img.mode == 'RGBA':
                    # Convert RGBA to RGB
                    image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        
        # Preprocess image for better OCR
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Apply threshold to get black and white image
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        
        # Configure Tesseract for optimal results
        custom_config = r'--oem 3 --psm 6 -l eng+osd --dpi 300'
        
        # Perform OCR on the processed image
        text = pytesseract.image_to_string(thresh, config=custom_config)
        
        logger.info(f"Extracted {len(text)} characters from image")
        return text
        
    except Exception as e:
        logger.error(f"Failed to extract text from image {file_path}: {str(e)}")
        return "" 