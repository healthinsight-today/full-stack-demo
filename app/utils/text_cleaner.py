import re
from typing import List

def normalize_whitespace(text: str) -> str:
    """
    Normalize whitespace in text: 
    - Replace multiple spaces with single space
    - Remove excessive line breaks (more than 2 consecutive)
    - Remove whitespace at beginning and end of lines
    
    Args:
        text: Input text to normalize
        
    Returns:
        Text with normalized whitespace
    """
    # Replace tabs with spaces
    text = text.replace('\t', ' ')
    
    # Replace multiple spaces with single space
    text = re.sub(r' +', ' ', text)
    
    # Split text into lines
    lines = text.split('\n')
    
    # Remove whitespace at beginning and end of each line
    lines = [line.strip() for line in lines]
    
    # Remove excess empty lines (keep at most 2 consecutive empty lines)
    clean_lines = []
    empty_line_count = 0
    
    for line in lines:
        if not line:
            empty_line_count += 1
            if empty_line_count <= 2:
                clean_lines.append(line)
        else:
            empty_line_count = 0
            clean_lines.append(line)
    
    # Join lines back into text
    clean_text = '\n'.join(clean_lines)
    
    # Ensure no more than 2 consecutive newlines
    clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
    
    return clean_text

def clean_ocr_artifacts(text: str) -> str:
    """
    Clean common OCR artifacts and errors:
    - Remove isolated special characters
    - Fix common OCR mistakes
    
    Args:
        text: Input OCR text to clean
        
    Returns:
        Cleaned text
    """
    # Remove isolated special characters (commonly misrecognized in OCR)
    text = re.sub(r'\s[@#$%^*_~`|<>]\s', ' ', text)
    
    # Replace multiple hyphens/dashes with a single dash
    text = re.sub(r'[-–—]{2,}', '-', text)
    
    # Remove characters that appear alone on a line (likely OCR artifacts)
    text = re.sub(r'^\s*[^\w\s]\s*$', '', text, flags=re.MULTILINE)
    
    return text

def enhance_ocr_text(text: str) -> str:
    """
    Enhance OCR text output by cleaning and normalizing it.
    
    Args:
        text: Raw OCR text
        
    Returns:
        Enhanced and cleaned text
    """
    # First clean OCR artifacts
    cleaned_text = clean_ocr_artifacts(text)
    
    # Then normalize whitespace
    normalized_text = normalize_whitespace(cleaned_text)
    
    return normalized_text 