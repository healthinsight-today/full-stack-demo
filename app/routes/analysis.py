"""
Analysis routes for processing medical reports
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import settings
from app.services.pdf_processor import process_pdf
from app.services.image_processor import process_image
from app.services.mcp_service import MCPService, MCPRequest
from app.services.templates import template_registry
from app.services.templates.analysis_template import AnalysisTemplate

# Set up logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/analysis",
    tags=["analysis"],
)

# Initialize services
mcp_service = MCPService()

class AnalysisResponse(BaseModel):
    """Standard response model for analysis endpoints"""
    success: bool
    data: Dict[str, Any]
    metadata: Dict[str, Any]

async def process_file_upload(file: UploadFile, force_ocr: bool = False) -> str:
    """Process an uploaded file and extract text"""
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process based on file type
        if file.filename.lower().endswith('.pdf'):
            if force_ocr:
                from app.services.ocr import extract_text_from_pdf_with_ocr
                text = await extract_text_from_pdf_with_ocr(file_path)
            else:
                text = await process_pdf(file_path)
        elif any(file.filename.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp']):
            text = await process_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file.filename}")
        
        # Validate extracted text
        if not text or len(text.strip()) < 50:
            raise ValueError("The extracted text is too short or empty. The file may be corrupted or contain no readable text.")
        
        return text
        
    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_medical_report(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    provider: str = Form("claude"),
    model: Optional[str] = Form(None),
    force_ocr: bool = Form(False),
    focus_areas: Optional[List[str]] = Form(None),
    customizations: Optional[Dict[str, Any]] = Form(None)
):
    """
    Analyze a medical report using the enhanced MCP system
    
    Args:
        file: The medical report file (PDF or image)
        text: Text content of the report (alternative to file upload)
        provider: LLM provider to use (claude, grok)
        model: Specific model to use
        force_ocr: Force OCR processing for PDFs
        focus_areas: Specific areas to focus analysis on
        customizations: Additional customization options for the analysis
    """
    start_time = datetime.now()
    
    try:
        # Get text content
        if file and not text:
            text = await process_file_upload(file, force_ocr)
        elif not text:
            raise HTTPException(
                status_code=400,
                detail="No input provided. Please upload a file or provide text content."
            )
        
        # Get analysis template
        template = template_registry.get_template("analysis")
        if not template:
            raise HTTPException(
                status_code=500,
                detail="Analysis template not found"
            )
        
        # Create context with customizations
        context = template.create_base_context()
        if customizations or focus_areas:
            custom_options = customizations or {}
            if focus_areas:
                custom_options["focus_areas"] = focus_areas
            context = template.customize_context(context, custom_options)
        
        # Add the report text to analyze
        context = mcp_service.add_message(
            context=context,
            role="user",
            content=f"Please analyze this medical report and extract the structured information:\n\n{text}"
        )
        
        # Create MCP request
        mcp_request = MCPRequest(
            context=context,
            provider=provider,
            model=model,
            temperature=0.1  # Low temperature for consistent formatting
        )
        
        # Generate response
        logger.info(f"Generating analysis with provider: {provider}")
        response = await mcp_service.generate_response(mcp_request)
        
        # Extract and validate structured data
        try:
            import json
            structured_data = json.loads(response.message.content)
            
            # Validate response
            is_valid, error_message = template.validate_response(structured_data)
            if not is_valid:
                raise ValueError(f"Invalid response format: {error_message}")
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse analysis result: {str(e)}"
            )
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Prepare response
        analysis_response = {
            "success": True,
            "data": structured_data,
            "metadata": {
                "processing_time_seconds": round(processing_time, 2),
                "provider": provider,
                "model": response.model,
                "template_version": template.version,
                "context_id": response.context.context_id
            }
        }
        
        # Save result if needed
        if settings.SAVE_ANALYSIS_RESULTS:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"analysis_{timestamp}_{str(uuid.uuid4())[:8]}.json"
            file_path = os.path.join(settings.REPORTS_DIR, filename)
            
            os.makedirs(settings.REPORTS_DIR, exist_ok=True)
            with open(file_path, "w") as f:
                json.dump(analysis_response, f, indent=2)
            
            analysis_response["metadata"]["saved_to"] = filename
        
        return AnalysisResponse(**analysis_response)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        logger.error(f"Error in analyze_medical_report: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing medical report: {str(e)}"
        ) 