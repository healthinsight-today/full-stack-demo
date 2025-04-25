import fitz  # PyMuPDF
import os
from typing import Optional
from app.utils.text_cleaner import enhance_ocr_text

def process_pdf(pdf_path: str, output_text_path: Optional[str] = None, clean_text: bool = True) -> str:
    """
    Process a PDF file to extract text content.
    
    Args:
        pdf_path: Path to the PDF file
        output_text_path: Path to save the extracted text (optional)
        clean_text: Whether to clean and normalize the extracted text
        
    Returns:
        The extracted text content
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    try:
        # Open the PDF
        doc = fitz.open(pdf_path)
        raw_text = ""
        
        # Extract text from each page
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            raw_text += page.get_text()
        
        # Clean and enhance the extracted text if requested
        text = enhance_ocr_text(raw_text) if clean_text else raw_text
        
        # Save the text to a file if output path is provided
        if output_text_path:
            with open(output_text_path, "w", encoding="utf-8") as f:
                f.write(text)
        
        return text
        
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")
    finally:
        if 'doc' in locals():
            doc.close() 