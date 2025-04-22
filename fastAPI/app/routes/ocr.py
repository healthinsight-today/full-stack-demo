from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Query
import os
import shutil
from typing import List, Optional
from app.services.pdf_processor import process_pdf
from app.services.image_processor import process_image, process_multiple_images
from app.config import settings
from fastapi.responses import PlainTextResponse

router = APIRouter(
    prefix="/ocr",
    tags=["ocr"],
)

# Helper function to determine file type
def is_image_file(filename: str) -> bool:
    """Check if the file is an image based on extension"""
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'}
    _, ext = os.path.splitext(filename.lower())
    return ext in image_extensions

def is_pdf_file(filename: str) -> bool:
    """Check if the file is a PDF based on extension"""
    return filename.lower().endswith('.pdf')

@router.post("/extract-text", response_class=PlainTextResponse)
async def extract_text(
    file: UploadFile = File(...),
    force_ocr: bool = Form(False, description="Force OCR even for PDFs"),
    clean_text: bool = Form(True, description="Clean and normalize extracted text")
):
    """
    Extract text from a PDF or image file and return it as plain text.
    Also saves the extracted text to the processed directory.
    
    - **file**: PDF or image file to process
    - **force_ocr**: For PDFs, whether to force OCR instead of native text extraction
    - **clean_text**: Whether to clean and normalize extracted text
    """
    filename = file.filename
    
    if not (is_pdf_file(filename) or is_image_file(filename)):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF and image files (PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP) are accepted"
        )
    
    # Create directories if they don't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    
    # Save uploaded file
    file_path = f"{settings.UPLOAD_DIR}/{filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Process file based on type
    text_file_path = f"{settings.PROCESSED_DIR}/{os.path.splitext(filename)[0]}.txt"
    
    if is_pdf_file(filename) and not force_ocr:
        # Process PDF using PDF processor
        extracted_text = process_pdf(file_path, text_file_path, clean_text)
    else:
        # Process image or forced OCR on PDF
        extracted_text = process_image(file_path, text_file_path, clean_text)
    
    return extracted_text

@router.post("/extract-text-batch", response_class=PlainTextResponse)
async def extract_text_batch(
    files: List[UploadFile] = File(...),
    output_filename: str = Form(..., description="Name for the output text file"),
    force_ocr: bool = Form(False, description="Force OCR even for PDFs"),
    clean_text: bool = Form(True, description="Clean and normalize extracted text")
):
    """
    Extract text from multiple files (PDFs or images) and combine the results.
    
    - **files**: List of PDF or image files to process
    - **output_filename**: Name for the output text file (without extension)
    - **force_ocr**: For PDFs, whether to force OCR instead of native text extraction
    - **clean_text**: Whether to clean and normalize extracted text
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Create directories if they don't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    
    # Process each file
    processed_paths = []
    file_paths = []
    
    for file in files:
        if not (is_pdf_file(file.filename) or is_image_file(file.filename)):
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} is not a supported format. Only PDFs and images are accepted."
            )
        
        # Save uploaded file
        file_path = f"{settings.UPLOAD_DIR}/{file.filename}"
        file_paths.append(file_path)
        
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        processed_paths.append(file_path)
    
    # Combined output path
    combined_text_path = f"{settings.PROCESSED_DIR}/{output_filename}.txt"
    
    # Process all files and combine results
    combined_text = ""
    
    for idx, file_path in enumerate(processed_paths):
        try:
            if is_pdf_file(file_path) and not force_ocr:
                # Process PDF using PDF processor (don't save individual file)
                text = process_pdf(file_path, None, clean_text)
            else:
                # Process image or forced OCR on PDF
                text = process_image(file_path, None, clean_text)
                
            combined_text += f"\n--- File {idx+1}: {os.path.basename(file_path)} ---\n{text}\n"
        except Exception as e:
            combined_text += f"\n--- File {idx+1}: {os.path.basename(file_path)} (Error) ---\nError: {str(e)}\n"
    
    # Save combined text
    with open(combined_text_path, "w", encoding="utf-8") as f:
        f.write(combined_text)
    
    return combined_text

@router.post("/extract-text-multipage", response_class=PlainTextResponse)
async def extract_text_multipage(
    files: List[UploadFile] = File(..., description="Up to 6 image files representing pages of a document"),
    document_name: str = Form(..., description="Name for the document"),
    page_order: Optional[str] = Form(None, description="Optional comma-separated list of page numbers to specify order (e.g., '3,1,2,4')"),
    clean_text: bool = Form(True, description="Clean and normalize extracted text")
):
    """
    Extract text from multiple image files representing pages of a single document.
    Limited to a maximum of 6 pages per document.
    
    - **files**: List of image files (up to 6) representing pages of a document
    - **document_name**: Name for the document (used for the output file)
    - **page_order**: Optional comma-separated list of page numbers to specify order
    - **clean_text**: Whether to clean and normalize extracted text
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Check page limit
    MAX_PAGES = 6
    if len(files) > MAX_PAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_PAGES} pages allowed per document. You provided {len(files)} files."
        )
    
    # Create directories if they don't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    
    # Save the uploaded files
    file_paths = []
    for idx, file in enumerate(files):
        if not is_image_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File {file.filename} is not a supported image format. Only image files are accepted for this endpoint."
            )
        
        # Save with a standardized name including page number
        file_path = f"{settings.UPLOAD_DIR}/{document_name}_page{idx+1}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        file_paths.append(file_path)
    
    # Process page ordering if specified
    ordered_paths = file_paths
    if page_order and page_order.lower() != "string":
        try:
            # Parse the page order string into a list of indices
            page_indices = [int(p.strip()) - 1 for p in page_order.split(',')]
            
            # Validate indices
            if max(page_indices) >= len(file_paths) or min(page_indices) < 0:
                # If indices out of range, use default order
                print(f"Warning: Page indices out of range, using default order")
            elif len(page_indices) != len(file_paths):
                # If count doesn't match, use default order
                print(f"Warning: Number of page indices doesn't match number of files, using default order")
            else:
                # Reorder the file paths
                ordered_paths = [file_paths[i] for i in page_indices]
        except Exception as e:
            # If any error in parsing, use default order instead of raising exception
            print(f"Warning: Could not parse page order '{page_order}': {str(e)}. Using default order.")
    
    # Process all images as a single document
    combined_text_path = f"{settings.PROCESSED_DIR}/{document_name}.txt"
    combined_text = process_multiple_images(ordered_paths, combined_text_path, clean_text)
    
    return combined_text

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