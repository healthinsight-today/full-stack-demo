import os
import pytesseract
from PIL import Image
import logging
from typing import Dict, Any, Optional
from app.utils.text_cleaner import enhance_ocr_text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_image(image_path: str, output_text_path: Optional[str] = None) -> str:
    """
    Process an image file to extract text content using OCR.
    
    Args:
        image_path: Path to the image file
        output_text_path: Optional path to save the extracted text
        
    Returns:
        The extracted text content
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Perform OCR
        logger.info(f"Performing OCR on image: {image_path}")
        raw_text = pytesseract.image_to_string(img)
        
        # Clean and enhance the OCR text
        text = enhance_ocr_text(raw_text)
        
        # Save the text to a file if specified
        if output_text_path:
            with open(output_text_path, "w", encoding="utf-8") as f:
                f.write(text)
            logger.info(f"Extracted text saved to: {output_text_path}")
        
        return text
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise Exception(f"Error processing image: {str(e)}")
    
def process_multiple_images(image_paths: list, output_text_path: Optional[str] = None) -> str:
    """
    Process multiple image files and combine the extracted text.
    
    Args:
        image_paths: List of paths to image files
        output_text_path: Optional path to save the combined extracted text
        
    Returns:
        The combined extracted text content
    """
    combined_text = ""
    
    for idx, image_path in enumerate(image_paths):
        try:
            text = process_image(image_path)
            combined_text += f"\n--- Page {idx+1} ---\n{text}\n"
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            combined_text += f"\n--- Page {idx+1} (Error) ---\nError: {str(e)}\n"
    
    # Final cleanup of the combined text to ensure consistent formatting
    combined_text = enhance_ocr_text(combined_text)
    
    # Save the combined text to a file if specified
    if output_text_path and combined_text:
        with open(output_text_path, "w", encoding="utf-8") as f:
            f.write(combined_text)
        logger.info(f"Combined extracted text saved to: {output_text_path}")
    
    return combined_text 