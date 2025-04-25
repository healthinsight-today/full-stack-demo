from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Query
import os
import shutil
from typing import List, Optional
from app.services.pdf_processor import process_pdf
from app.config import settings
from fastapi.responses import PlainTextResponse

router = APIRouter(
    prefix="/pdf",
    tags=["pdf"],
)

@router.post("/extract-text", response_class=PlainTextResponse)
async def extract_text(
    file: UploadFile = File(...),
    clean_text: bool = Form(True, description="Clean and normalize extracted text")
):
    """
    Extract text from a PDF file and return it as plain text.
    Also saves the extracted text to the processed directory.
    
    - **file**: PDF file to process
    - **clean_text**: Whether to clean and normalize extracted text
    """
    filename = file.filename
    
    if not filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are accepted"
        )
    
    # Create directories if they don't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    
    # Save uploaded file
    file_path = f"{settings.UPLOAD_DIR}/{filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Process file
    text_file_path = f"{settings.PROCESSED_DIR}/{os.path.splitext(filename)[0]}.txt"
    extracted_text = process_pdf(file_path, text_file_path, clean_text)
    
    return extracted_text

@router.get("/get-text/{filename}", response_class=PlainTextResponse)
async def get_extracted_text(filename: str):
    """
    Get previously extracted text by filename.
    """
    # Ensure filename doesn't have .pdf extension
    base_filename = os.path.splitext(filename)[0]
    text_file_path = f"{settings.PROCESSED_DIR}/{base_filename}.txt"
    
    if not os.path.exists(text_file_path):
        raise HTTPException(status_code=404, detail=f"No extracted text found for {filename}")
    
    with open(text_file_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    return text 