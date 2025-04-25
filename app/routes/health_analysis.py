"""
API routes for health analysis functionality.
"""

import json
import os
import time
import uuid
import logging
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, List, Literal
import mimetypes
import magic

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pathlib import Path

from app.config import settings
from app.services.pdf_processor import process_pdf
from app.services.image_processor import process_image
from app.services.mcp_service import MCPService
from app.services.llm_advanced_processor import LLMProcessor
from app.services.basic_analyzer import get_health_insights
from app.services.document_processor import (
    extract_text_from_file,
    is_pdf_file,
    is_image_file,
    save_uploaded_file
)

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Health Analysis"]
)

# Initialize MCP service
mcp_service = MCPService()

# Add missing AnalysisResult model
class AnalysisResult(BaseModel):
    """Result from an LLM analysis of a medical report"""
    run_id: str
    provider: str
    model: str
    analysis: Dict[str, Any]
    processing_time: float
    text: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "run_id": "82e082b0-858c-4b06-8a48-fd8a7d0419e2",
                "provider": "claude",
                "model": "claude-3-7-sonnet-20250219",
                "analysis": {
                    "report_info": {
                        "report_id": "BT-2023-1234",
                        "report_type": "Blood Test",
                        "report_date": "2023-10-15",
                        "lab_name": "HealthLab Diagnostics"
                    },
                    "patient_info": {
                        "name": "John Doe",
                        "age": 45,
                        "gender": "Male"
                    },
                    "test_sections": [
                        {
                            "section_name": "Complete Blood Count",
                            "parameters": []
                        }
                    ],
                    "abnormal_parameters": [],
                    "health_insights": []
                },
                "processing_time": 3.45
            }
        }

def get_llm_processor():
    """Get an initialized LLM processor"""
    return LLMProcessor()

def get_mcp_system_message():
    """Get the system message for blood test analysis"""
    return """You are an AI medical assistant specialized in analyzing blood test reports.

Your ONLY job is to return JSON with exactly these fields and nesting:
{
  "report_info": {
    "report_id": string,
    "report_type": string,
    "report_date": string (YYYY-MM-DD),
    "lab_name": string
  },
  "patient_info": {
    "name": string,
    "age": number,
    "gender": string,
    "id": string if available
  },
  "test_sections": [
    {
      "section_name": string,
      "parameters": [
        {
          "name": string,
          "value": number | string,
          "unit": string,
          "reference_range": string,
          "is_abnormal": boolean,
          "direction": "high" | "low" | null
        }
      ]
    }
  ],
  "abnormal_parameters": [
    {
      "name": string,
      "value": number | string,
      "unit": string,
      "reference_range": string,
      "direction": "high" | "low"
    }
  ],
  "health_insights": [
    {
      "condition": string,
      "confidence": number,
      "parameters": [string],
      "description": string,
      "recommendations": [
        {
          "type": "dietary" | "lifestyle" | "medical" | "testing",
          "text": string
        }
      ]
    }
  ]
}

DO NOT add, remove, or rename any fields. Follow the schema EXACTLY as shown above.
Use the same field names and nesting structure for all responses.
Return ONLY the JSON object without any additional text before or after it.
"""

def extract_text_from_file(file_path: str) -> str:
    """Extract text from a file based on its type"""
    if is_pdf_file(file_path):
        return process_pdf(file_path, None)
    elif is_image_file(file_path):
        return process_image(file_path, None)
    else:
        raise ValueError(f"Unsupported file type: {file_path}")

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

def save_json_analysis(analysis: Dict[str, Any], filename_base: str) -> str:
    """Save JSON analysis to a file"""
    # Create directory if it doesn't exist
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{filename_base}_{timestamp}.json"
    file_path = os.path.join(settings.PROCESSED_DIR, filename)
    
    # Save to file with pretty formatting
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, default=str)
        
    return filename

def validate_health_analysis(analysis: Dict[str, Any]) -> tuple:
    """Validate the structure of health analysis JSON"""
    required_keys = [
        "patient_info", 
        "blood_parameters", 
        "abnormalities", 
        "deficiencies", 
        "health_score",
        "summary"
    ]
    
    for key in required_keys:
        if key not in analysis:
            return False, f"Missing required key: {key}"
    
    # Check patient_info
    if not isinstance(analysis["patient_info"], dict):
        return False, "patient_info must be a dictionary"
    
    # Check blood_parameters
    if not isinstance(analysis["blood_parameters"], list):
        return False, "blood_parameters must be a list"
    
    # Check abnormalities
    if not isinstance(analysis["abnormalities"], list):
        return False, "abnormalities must be a list"
        
    return True, ""

# Response models
class HealthAnalysisResponse(BaseModel):
    report_id: str
    report_information: dict
    patient_info: dict
    test_sections: List[dict] = []
    abnormal_parameters: List[dict] = []
    health_insights: dict
    processing_metadata: Optional[dict] = None

# Add Pydantic models for validation
class TestParameter(BaseModel):
    name: str
    value: Any
    unit: str
    reference_range: str
    is_abnormal: bool
    direction: Optional[str] = None

class TestSection(BaseModel):
    section_name: str
    parameters: List[TestParameter]

class AbnormalParameter(BaseModel):
    name: str
    value: Any
    unit: str
    reference_range: str
    direction: str

class Recommendation(BaseModel):
    type: str
    text: str

class HealthInsight(BaseModel):
    condition: str
    confidence: float
    parameters: List[str]
    description: str
    recommendations: List[Recommendation]

class ReportInfo(BaseModel):
    report_id: str
    report_type: str
    report_date: str
    lab_name: str

class PatientInfo(BaseModel):
    name: str
    age: Optional[float] = None
    gender: Optional[str] = None
    id: Optional[str] = None

class FileInfo(BaseModel):
    filename: str
    file_id: str
    file_size: int
    upload_time: str
    text_path: str
    json_path: Optional[str] = None

class MetadataInfo(BaseModel):
    processing_time: float
    processing_timestamp: str
    model_used: str
    provider: str
    context_id: str
    run_id: str
    tokens_in: int = 0
    tokens_out: int = 0

class BloodReport(BaseModel):
    report_info: ReportInfo
    patient_info: PatientInfo
    test_sections: List[TestSection]
    abnormal_parameters: List[AbnormalParameter]
    health_insights: List[HealthInsight]
    metadata: Optional[MetadataInfo] = None
    file_info: Optional[FileInfo] = None

class RecommendationItem(BaseModel):
    type: Literal["dietary", "lifestyle", "medical", "testing"]
    text: str
    
    class Config:
        schema_extra = {
            "example": {
                "type": "dietary",
                "text": "Increase consumption of vitamin D-rich foods like fatty fish, egg yolks, and fortified dairy products."
            }
        }

class InsightItem(BaseModel):
    condition: str
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    parameters: List[str] = Field(..., description="List of test parameters related to this condition")
    description: str
    recommendations: List[RecommendationItem]
    
    class Config:
        schema_extra = {
            "example": {
                "condition": "Vitamin D Deficiency",
                "confidence": 0.95,
                "parameters": ["25-Hydroxy Vitamin D"],
                "description": "Severe vitamin D deficiency detected based on 25-Hydroxy Vitamin D levels. This can impact bone health, immune function, and overall well-being.",
                "recommendations": [
                    {
                        "type": "dietary",
                        "text": "Increase consumption of vitamin D-rich foods like fatty fish, egg yolks, and fortified dairy products."
                    },
                    {
                        "type": "lifestyle",
                        "text": "Get 15-30 minutes of direct sunlight exposure several times per week."
                    },
                    {
                        "type": "medical",
                        "text": "Consider vitamin D supplementation after consulting with your healthcare provider."
                    }
                ]
            }
        }

class RecommendationsResponse(BaseModel):
    recommendations: List[RecommendationItem]
    report_id: str
    count: int

class AbnormalParametersResponse(BaseModel):
    parameters: List[AbnormalParameter]
    report_id: str
    count: int

@router.get("/providers")
async def get_providers():
    """
    Get available LLM providers for health analysis.
    
    Returns:
        JSON with available providers and their status
    """
    try:
        # Use the LLMProcessor to get provider information
        llm_processor = LLMProcessor()
        providers_info = llm_processor.get_providers_info()
        
        return providers_info
    except Exception as e:
        logger.error(f"Error getting providers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving provider information: {str(e)}"
        )

@router.post("/analyze-report-with-mcp", response_model=AnalysisResult)
async def analyze_report_with_mcp(
    file: UploadFile = File(...),
    context: Optional[str] = Form(None),
    provider: str = Form("grok"),
    model: str = Form("grok-3-latest"),
    include_text: bool = Form(False)
):
    """
    Analyze a blood test report PDF using MCP context and LLMProcessor.
    
    Supports multiple LLM providers (Claude, Grok, etc.).
    
    Steps:
    1. Generate unique run ID
    2. Save uploaded file
    3. Extract text from PDF/image
    4. Process text with appropriate LLM
    5. Return analysis results
    """
    processor = get_llm_processor()
    run_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Create run status tracking
    run_status = create_run(
        run_id=run_id,
        provider=provider,
        model=model,
        filename=file.filename or "unknown",
        status="started"
    )
    
    try:
        logger.info(f"Processing blood test report with {provider}/{model}, run_id: {run_id}")
        
        # Generate unique document ID and prepare paths
        document_id = str(uuid.uuid4())
        original_filename = file.filename or "document"
        file_extension = os.path.splitext(original_filename)[1].lower()
        
        # Create directories if they don't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        text_dir = Path(settings.TEXT_DIR)
        json_dir = Path(settings.REPORTS_JSON_DIR)
        
        for directory in [upload_dir, text_dir, json_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Define file paths
        file_path = upload_dir / f"{document_id}{file_extension}"
        text_path = text_dir / f"{document_id}.txt"
        json_path = json_dir / f"{run_id}.json"
        
        # Save the uploaded file
        logger.info(f"[{run_id}] Saving uploaded file {original_filename} to {file_path}")
        update_run(run_id, status="saving_file")
        saved_file_path = await save_uploaded_file(file, file_path)
        
        # Check if the file is valid (PDF or image)
        is_pdf = is_pdf_file(original_filename, str(saved_file_path))
        is_image = is_image_file(original_filename, str(saved_file_path))
        
        if not (is_pdf or is_image):
            # If invalid file type, delete it and raise an exception
            if saved_file_path.exists():
                saved_file_path.unlink()
            
            update_run(run_id, status="failed", error="Unsupported file type")
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Only PDF and image files are accepted."
            )
        
        # Extract text from the file
        logger.info(f"[{run_id}] Extracting text from {file_path}")
        update_run(run_id, status="extracting_text")
        text = extract_text_from_file(str(saved_file_path))
        
        if not text or len(text.strip()) < 50:
            update_run(run_id, status="failed", error="Text extraction failed or produced insufficient text")
            raise HTTPException(
                status_code=422,
                detail="Failed to extract sufficient text from the document. Please try a clearer image or a properly formatted PDF."
            )
        
        # Save extracted text to text directory
        with open(text_path, "w", encoding="utf-8") as text_file:
            text_file.write(text)
        
        # Update run with metadata
        update_run(
            run_id, 
            status="processing_text",
            metadata={
                "document_id": document_id,
                "file_type": "PDF" if is_pdf else "Image",
                "word_count": len(text.split()),
                "char_count": len(text),
                "page_count": 1,  # Default to 1 for now
                "ocr_used": False,  # Default to False for now
                "text_extraction_time": time.time() - start_time
            }
        )
        
        # Process with LLM
        logger.info(f"[{run_id}] Processing text with {provider}/{model}")
        
        # Add context if provided
        if context:
            text = f"{text}\n\nAdditional Context:\n{context}"
        
        # Process with retries
        max_retries = 2
        retry_count = 0
        
        while retry_count <= max_retries:
            try:
                # Use process_medical_report instead of process_messages
                analysis_json = await processor.process_medical_report(text)
                break
            except Exception as e:
                retry_count += 1
                logger.warning(f"[{run_id}] LLM processing attempt {retry_count} failed: {str(e)}")
                
                if retry_count > max_retries:
                    update_run(run_id, status="failed", error=f"LLM processing failed after {max_retries} retries")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to process report after {max_retries} attempts: {str(e)}"
                    )
                
                # Wait before retrying
                await asyncio.sleep(2)
        
        # Save JSON to file
        with open(json_path, "w", encoding="utf-8") as json_file:
            json.dump(analysis_json, json_file, indent=2)
            
        update_run(run_id, status="completed")
        
        # Prepare result
        result = {
            "run_id": run_id,
            "provider": provider,
            "model": model,
            "analysis": analysis_json,
            "processing_time": time.time() - start_time
        }
        
        if include_text:
            result["text"] = text
            
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"[{run_id}] Error processing report: {str(e)}", exc_info=True)
        update_run(run_id, status="failed", error=str(e))
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing report: {str(e)}"
        )
        
# Helper functions for tracking runs

def create_run(run_id: str, provider: str, model: str, filename: str, status: str) -> Dict[str, Any]:
    """Create and store a new run status"""
    run_data = {
        "run_id": run_id,
        "provider": provider,
        "model": model,
        "filename": filename,
        "status": status,
        "start_time": time.time(),
        "updated_time": time.time(),
        "metadata": {}
    }
    
    # In a production app, you would store this in a database
    # For now, we'll log it and return the data
    logger.info(f"Created run: {run_id} ({status})")
    return run_data

def update_run(run_id: str, status: str = None, error: str = None, metadata: Dict[str, Any] = None) -> None:
    """Update an existing run status"""
    update_data = {
        "updated_time": time.time()
    }
    
    if status:
        update_data["status"] = status
        
    if error:
        update_data["error"] = error
        
    if metadata:
        update_data["metadata"] = metadata
    
    # In a production app, you would update this in a database
    # For now, we'll just log it
    logger.info(f"Updated run: {run_id} ({status or 'metadata update'})")

@router.post("/save")
async def save_analysis(
    analysis: Dict[str, Any],
    filename_base: Optional[str] = None
):
    """
    Save a blood test analysis to a file
    
    - **analysis**: The analysis JSON to save
    - **filename_base**: Optional base name for the file (defaults to patient name if available)
    """
    try:
        # Create a more flexible validation
        if not isinstance(analysis, dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid analysis structure: must be a JSON object"
            )
        
        # Determine filename base
        if not filename_base:
            # Try to use patient name or ID from analysis
            if "patient_info" in analysis and isinstance(analysis["patient_info"], dict):
                patient_info = analysis["patient_info"]
                if "name" in patient_info and patient_info["name"]:
                    filename_base = patient_info["name"].replace(" ", "_").lower()
                elif "patient_id" in patient_info and patient_info["patient_id"]:
                    filename_base = f"patient_{patient_info['patient_id']}"
            elif "patient" in analysis and isinstance(analysis["patient"], dict):
                patient = analysis["patient"]
                if "name" in patient and patient["name"]:
                    filename_base = patient["name"].replace(" ", "_").lower()
                elif "patient_id" in patient and patient["patient_id"]:
                    filename_base = f"patient_{patient['patient_id']}"
            
            # If still no filename_base, use a generic one
            if not filename_base:
                filename_base = f"health_analysis_{str(uuid.uuid4())[:8]}"
        
        # Create reports directory if it doesn't exist
        os.makedirs(settings.REPORTS_DIR, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{filename_base}_{timestamp}.json"
        file_path = os.path.join(settings.REPORTS_DIR, filename)
        
        # Add metadata if not present
        if "metadata" not in analysis:
            analysis["metadata"] = {}
        
        # Add save information to metadata
        analysis["metadata"].update({
            "saved_at": datetime.now().isoformat(),
            "filename": filename,
            "file_path": file_path
        })
        
        # Save to file with pretty formatting
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2)
        
        return {
            "message": "Analysis saved successfully",
            "filename": filename,
            "path": file_path,
            "directory": settings.REPORTS_DIR,
            "timestamp": datetime.now().isoformat(),
            "metadata": analysis.get("metadata", {})
        }
    
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error saving analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving analysis: {str(e)}")

@router.get("/reports")
async def get_reports():
    """
    Get a list of saved health reports
    """
    try:
        reports = []
        
        # Check both directories for reports
        for directory in [settings.REPORTS_DIR, settings.PROCESSED_DIR, settings.UPLOAD_DIR]:
            # Create directory if it doesn't exist
            os.makedirs(directory, exist_ok=True)
            
            # List JSON files in the directory
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    if filename.endswith(".json") and "_analysis" in filename:
                        file_path = os.path.join(directory, filename)
                        
                        try:
                            # Read the file to get basic info
                            with open(file_path, "r", encoding="utf-8") as f:
                                data = json.load(f)
                            
                            # Extract basic info - handle different formats
                            if "patient_info" in data:
                                patient_info = data.get("patient_info", {})
                                name = patient_info.get("name", "Unknown")
                            elif "patient" in data:
                                patient_info = data.get("patient", {})
                                name = patient_info.get("name", "Unknown")
                            else:
                                name = "Unknown"
                                
                            # Try to find date information
                            date = None
                            if "metadata" in data and "processing_timestamp" in data["metadata"]:
                                date = data["metadata"]["processing_timestamp"].split("T")[0]
                            elif "test_info" in data and "date" in data["test_info"]:
                                date = data["test_info"]["date"]
                            elif "report_info" in data and "report_date" in data["report_info"]:
                                date = data["report_info"]["report_date"]
                            else:
                                date = "Unknown"
                            
                            # Extract report_id from report_info, but prefer using file_id as the consistent ID
                            report_id = None
                            if "file_info" in data and "file_id" in data["file_info"]:
                                report_id = data["file_info"]["file_id"]
                            elif "report_info" in data and "report_id" in data["report_info"]:
                                report_id = data["report_info"]["report_id"]
                            else:
                                # Use filename without extension as fallback
                                report_id = os.path.splitext(filename)[0]
                            
                            # Get provider information
                            provider = data.get("metadata", {}).get("provider", "Unknown")
                            
                            # Check both model and model_used fields
                            model = None
                            if "metadata" in data:
                                if "model_used" in data["metadata"]:
                                    model = data["metadata"]["model_used"]
                                elif "model" in data["metadata"]:
                                    model = data["metadata"]["model"]
                            
                            if not model:
                                model = "Unknown"
                            
                            # Extract run_id, first from metadata, then from file_info
                            run_id = None
                            if "metadata" in data and "run_id" in data["metadata"]:
                                run_id = data["metadata"]["run_id"]
                            elif "file_info" in data and "file_id" in data["file_info"]:
                                # Use file_id as run_id if available
                                run_id = data["file_info"]["file_id"]
                            else:
                                # Extract UUID from filename if present or use part of the filename
                                file_parts = filename.split("_")
                                if len(file_parts) > 0 and len(file_parts[0]) > 8:
                                    run_id = file_parts[0]
                                else:
                                    run_id = str(uuid.uuid4())
                            
                            # Extract context_id from metadata if available
                            context_id = None
                            if "metadata" in data and "context_id" in data["metadata"]:
                                context_id = data["metadata"]["context_id"]
                                
                            # Ensure context_id is never null
                            if not context_id:
                                # Try to get from file_id
                                if "file_info" in data and "file_id" in data["file_info"]:
                                    context_id = data["file_info"]["file_id"]
                                else:
                                    # Generate based on report_id
                                    context_id = str(uuid.uuid4())
                                    logger.debug(f"Generated new context_id for report: {report_id}")
                            
                            # Extract token usage if available
                            tokens_in = data.get("metadata", {}).get("tokens_in", 0)
                            tokens_out = data.get("metadata", {}).get("tokens_out", 0)
                            
                            # Check usage field at root level as alternative source
                            if "usage" in data and isinstance(data["usage"], dict):
                                if tokens_in == 0:
                                    tokens_in = data["usage"].get("prompt_tokens", 0)
                                if tokens_out == 0:
                                    tokens_out = data["usage"].get("completion_tokens", 0)
                            
                            tokens = {
                                "in": tokens_in,
                                "out": tokens_out
                            }
                            
                            # Add file details with new fields
                            reports.append({
                                "filename": filename,
                                "path": file_path,
                                "directory": directory,
                                "patient_name": name,
                                "report_date": date,
                                "file_date": datetime.fromtimestamp(
                                    os.path.getmtime(file_path)
                                ).strftime("%Y-%m-%d %H:%M:%S"),
                                "file_size": os.path.getsize(file_path),
                                "provider": provider,
                                "model": model,
                                "report_id": report_id,
                                "run_id": run_id,
                                "user_id": data.get("metadata", {}).get("user_id", None),
                                "context_id": context_id,
                                "tokens": tokens,
                                "medical_report_id": data.get("report_info", {}).get("report_id", "")
                            })
                            
                        except Exception as e:
                            # Log the error but don't fail the whole request
                            logger.error(f"Error parsing report file {file_path}: {str(e)}")
                            
                            # Add with limited information
                            file_id = os.path.splitext(filename)[0]
                            
                            reports.append({
                                "filename": filename,
                                "path": file_path,
                                "directory": directory,
                                "error": f"Could not parse file: {str(e)}",
                                "file_date": datetime.fromtimestamp(
                                    os.path.getmtime(file_path)
                                ).strftime("%Y-%m-%d %H:%M:%S"),
                                "file_size": os.path.getsize(file_path),
                                # Add default values for the new fields without estimation
                                "report_id": file_id,
                                "run_id": file_id,
                                "user_id": None,
                                "context_id": file_id,
                                "tokens": {"in": 0, "out": 0},  # Use 0 for actual values
                                "medical_report_id": "",
                                "provider": "Unknown",
                                "model": "Unknown"
                            })
        
        # Sort reports by file date, newest first
        reports.sort(key=lambda x: x.get("file_date", ""), reverse=True)
        
        return {"reports": reports, "count": len(reports)}
    
    except Exception as e:
        logger.error(f"Error listing reports: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing reports: {str(e)}")

@router.get("/report/{filename}")
async def get_report(filename: str):
    """
    Get a specific health report by filename
    
    - **filename**: The filename of the report to retrieve
    """
    try:
        # Search for the file in all possible directories
        for directory in [settings.REPORTS_DIR, settings.PROCESSED_DIR, settings.UPLOAD_DIR]:
            file_path = os.path.join(directory, filename)
            
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Add file location info
                if isinstance(data, dict) and "metadata" not in data:
                    data["metadata"] = {}
                
                if isinstance(data, dict) and "metadata" in data:
                    data["metadata"]["file_path"] = file_path
                    data["metadata"]["directory"] = directory
                
                return data
        
        # If we get here, the file wasn't found
        raise HTTPException(
            status_code=404,
            detail=f"Report not found: {filename}"
        )
    
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing report file {filename}: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Error parsing report file: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error retrieving report {filename}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving report: {str(e)}"
        )

@router.get("/reports/{run_id}")
async def get_report_by_id(run_id: str):
    """
    Get a specific health report by run_id (or report_id)
    
    - **run_id**: The unique identifier of the report to retrieve
    
    Returns:
        The complete report JSON with all analysis data
    """
    try:
        # Search for files with this run_id in all possible directories
        for directory in [settings.REPORTS_JSON_DIR, settings.REPORTS_DIR, settings.PROCESSED_DIR, settings.UPLOAD_DIR]:
            # Skip if directory doesn't exist
            if not os.path.exists(directory):
                continue
                
            # Look for files with the run_id in their name
            for filename in os.listdir(directory):
                if run_id in filename and filename.endswith('.json'):
                    file_path = os.path.join(directory, filename)
                    logger.info(f"Found report file for run_id {run_id}: {file_path}")
                    
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    # Validate the run_id matches, either in metadata or file_info
                    file_run_id = None
                    if "metadata" in data and "run_id" in data["metadata"]:
                        file_run_id = data["metadata"]["run_id"]
                    elif "file_info" in data and "file_id" in data["file_info"]:
                        file_run_id = data["file_info"]["file_id"]
                    
                    # If file_run_id exists and doesn't match requested run_id, skip this file
                    if file_run_id and file_run_id != run_id:
                        continue
                    
                    # Add file location info if not present
                    if "metadata" not in data:
                        data["metadata"] = {}
                    
                    # Update metadata with file location
                    data["metadata"]["file_path"] = file_path
                    data["metadata"]["directory"] = directory
                    
                    return data
        
        # If we get here, no file with matching run_id was found
        # Try searching inside files as a fallback
        for directory in [settings.REPORTS_JSON_DIR, settings.REPORTS_DIR, settings.PROCESSED_DIR, settings.UPLOAD_DIR]:
            if not os.path.exists(directory):
                continue
                
            for filename in os.listdir(directory):
                if filename.endswith('.json'):
                    file_path = os.path.join(directory, filename)
                    
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        
                        # Check if run_id or report_id matches in the content
                        if (("metadata" in data and "run_id" in data["metadata"] and data["metadata"]["run_id"] == run_id) or
                            ("file_info" in data and "file_id" in data["file_info"] and data["file_info"]["file_id"] == run_id) or
                            ("report_info" in data and "report_id" in data["report_info"] and data["report_info"]["report_id"] == run_id)):
                            
                            logger.info(f"Found report with matching ID in content: {file_path}")
                            
                            # Add file location info
                            if "metadata" not in data:
                                data["metadata"] = {}
                            
                            data["metadata"]["file_path"] = file_path
                            data["metadata"]["directory"] = directory
                            
                            return data
                    except Exception as e:
                        logger.warning(f"Error reading file {file_path}: {str(e)}")
                        continue
        
        # If we get here, the file wasn't found
        raise HTTPException(
            status_code=404,
            detail=f"Report not found for ID: {run_id}"
        )
    
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing report file for run_id {run_id}: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Error parsing report file: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving report for run_id {run_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving report: {str(e)}"
        )

@router.get(
    "/reports/{run_id}/insights", 
    response_model=List[InsightItem],
    responses={
        200: {
            "description": "List of health insights from the report",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "condition": "Vitamin D Deficiency",
                            "confidence": 0.95,
                            "parameters": ["25-Hydroxy Vitamin D"],
                            "description": "Severe vitamin D deficiency detected based on 25-Hydroxy Vitamin D levels. This can impact bone health, immune function, and overall well-being.",
                            "recommendations": [
                                {
                                    "type": "dietary",
                                    "text": "Increase consumption of vitamin D-rich foods like fatty fish, egg yolks, and fortified dairy products."
                                },
                                {
                                    "type": "lifestyle",
                                    "text": "Get 15-30 minutes of direct sunlight exposure several times per week."
                                },
                                {
                                    "type": "medical",
                                    "text": "Consider vitamin D supplementation after consulting with your healthcare provider."
                                }
                            ]
                        },
                        {
                            "condition": "Subclinical Hypothyroidism",
                            "confidence": 0.85,
                            "parameters": ["TSH - Thyroid Stimulating Hormone"],
                            "description": "Elevated TSH levels indicate possible subclinical hypothyroidism. This may affect metabolism and energy levels.",
                            "recommendations": [
                                {
                                    "type": "medical",
                                    "text": "Follow up with an endocrinologist for further evaluation."
                                },
                                {
                                    "type": "testing",
                                    "text": "Consider testing for thyroid antibodies to check for autoimmune thyroid disease."
                                },
                                {
                                    "type": "lifestyle",
                                    "text": "Ensure adequate iodine intake through diet or supplements if recommended by your doctor."
                                }
                            ]
                        }
                    ]
                }
            }
        },
        404: {
            "description": "Report or insights not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Health insights not found for report: 13ca4bac-a0b3-4553-a26d-97a5373e4144"}
                }
            }
        },
        422: {
            "description": "Invalid insight format",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid insight format: 1 validation error for InsightItem\nconfidence\n  field required (type=value_error.missing)"}
                }
            }
        }
    }
)
async def get_report_insights(run_id: str):
    """
    Get just the health insights from a specific report
    
    - **run_id**: The unique identifier of the report
    
    Returns:
        Array of health insights from the report, each containing:
        - condition: The identified health condition
        - confidence: Confidence score (0-1)
        - parameters: List of test parameters related to this insight
        - description: Detailed description of the insight
        - recommendations: List of recommended actions by type
    """
    try:
        # Reuse the existing report loading logic
        report_data = await get_report_by_id(run_id)
        
        # Extract health_insights
        if not report_data or "health_insights" not in report_data:
            raise HTTPException(
                status_code=404,
                detail=f"Health insights not found for report: {run_id}"
            )
            
        insights = report_data.get("health_insights", [])
        
        # Determine the format and handle accordingly
        if isinstance(insights, list):
            # It's already an array format
            logger.info(f"Health insights for {run_id} is an array with {len(insights)} items")
        elif isinstance(insights, dict):
            # It's an object format, convert to array
            logger.info(f"Health insights for {run_id} is an object, converting to array format")
            
            # Handle the specific format in the example (clinical_interpretation + recommendations)
            if "clinical_interpretation" in insights and "recommendations" in insights:
                # Extract abnormal parameters from the report if available
                abnormal_params = []
                if "abnormal_parameters" in report_data and isinstance(report_data["abnormal_parameters"], list):
                    abnormal_params = [param.get("name", "") for param in report_data["abnormal_parameters"] if "name" in param]
                
                # Convert to array format with a single comprehensive entry
                insights = [{
                    "condition": "Comprehensive Health Assessment",
                    "confidence": 0.9,
                    "parameters": abnormal_params if abnormal_params else ["Multiple Parameters"],
                    "description": insights["clinical_interpretation"],
                    "recommendations": [
                        {
                            # Categorize recommendations
                            "type": "medical" if "consult" in rec.lower() or "doctor" in rec.lower() or "follow up" in rec.lower() 
                                   else "dietary" if "diet" in rec.lower() or "food" in rec.lower() or "nutrition" in rec.lower()
                                   else "lifestyle" if "lifestyle" in rec.lower() or "exercise" in rec.lower() or "sun" in rec.lower()
                                   else "testing" if "test" in rec.lower() or "monitor" in rec.lower() 
                                   else "medical",
                            "text": rec
                        }
                        for rec in insights["recommendations"]
                    ]
                }]
            else:
                # For other object formats, create a generic insight
                insights = [{
                    "condition": "Health Analysis",
                    "confidence": 0.8,
                    "parameters": ["Multiple Parameters"],
                    "description": "Analysis of multiple health parameters from your blood test.",
                    "recommendations": [
                        {
                            "type": "medical",
                            "text": "Please consult with your healthcare provider to discuss these results in detail."
                        }
                    ]
                }]
                
                # Try to extract any recommendations
                if isinstance(insights, dict) and "recommendations" in insights and isinstance(insights["recommendations"], list):
                    insights[0]["recommendations"] = [
                        {
                            "type": "medical",
                            "text": rec
                        }
                        for rec in insights["recommendations"] if isinstance(rec, str)
                    ]
        else:
            # Neither array nor object
            logger.warning(f"Health insights for {run_id} is neither array nor object: {type(insights)}")
            raise HTTPException(
                status_code=422,
                detail=f"Invalid format: health_insights should be an array or object, got {type(insights)}"
            )
            
        # Validate each insight with Pydantic
        try:
            validated_insights = [InsightItem(**insight) for insight in insights]
            return validated_insights
        except Exception as validation_error:
            logger.error(f"Validation error in insights for {run_id}: {str(validation_error)}")
            raise HTTPException(
                status_code=422,
                detail=f"Invalid insight format: {str(validation_error)}"
            )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving insights for run_id {run_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving insights: {str(e)}"
        )

@router.get(
    "/reports/{run_id}/recommendations", 
    response_model=RecommendationsResponse,
    responses={
        200: {
            "description": "List of all recommendations from the report",
            "content": {
                "application/json": {
                    "example": {
                        "recommendations": [
                            {
                                "type": "dietary",
                                "text": "Increase consumption of vitamin D-rich foods like fatty fish, egg yolks, and fortified dairy products."
                            },
                            {
                                "type": "lifestyle",
                                "text": "Get 15-30 minutes of direct sunlight exposure several times per week."
                            },
                            {
                                "type": "medical",
                                "text": "Consider vitamin D supplementation after consulting with your healthcare provider."
                            },
                            {
                                "type": "medical",
                                "text": "Follow up with an endocrinologist for further evaluation."
                            },
                            {
                                "type": "testing",
                                "text": "Consider testing for thyroid antibodies to check for autoimmune thyroid disease."
                            }
                        ],
                        "report_id": "13ca4bac-a0b3-4553-a26d-97a5373e4144",
                        "count": 5
                    }
                }
            }
        },
        404: {
            "description": "Report or recommendations not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Report not found for ID: 13ca4bac-a0b3-4553-a26d-97a5373e4144"}
                }
            }
        }
    }
)
async def get_report_recommendations(run_id: str):
    """
    Get all recommendations from a specific report
    
    - **run_id**: The unique identifier of the report
    
    Returns:
        A consolidated list of recommendations from all insights in the report,
        including each recommendation's type and text content.
    """
    try:
        # First get the insights
        insights = await get_report_insights(run_id)
        
        # Extract all recommendations from all insights
        all_recommendations = []
        for insight in insights:
            all_recommendations.extend(insight.recommendations)
            
        # Sort recommendations by type for better organization
        all_recommendations.sort(key=lambda x: x.type)
        
        return {
            "recommendations": all_recommendations,
            "report_id": run_id,
            "count": len(all_recommendations)
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving recommendations for run_id {run_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving recommendations: {str(e)}"
        )

def get_health_insights(text: str) -> dict:
    """
    Legacy fallback function for getting health insights when advanced processor is not used.
    
    Args:
        text: The text content of a medical report
        
    Returns:
        A dictionary containing basic health insights
    """
    try:
        logger.info("Processing health insights using legacy function")
        
        # Create a basic structure for the response
        insights = {
            "report_information": {
                "report_type": "Blood Test",
                "report_date": datetime.now().strftime("%Y-%m-%d"),
                "laboratory": "Unknown"
            },
            "patient_info": {
                "name": "Not extracted",
                "age": "Not extracted",
                "gender": "Not extracted"
            },
            "test_sections": [],
            "abnormal_parameters": [],
            "health_insights": {
                "summary": "Basic analysis of the provided medical report",
                "recommendations": [
                    "Please consult with a healthcare professional to interpret these results",
                    "Regular follow-up is recommended for any abnormal values"
                ]
            }
        }
        
        # Extract some basic information if possible
        lines = text.split('\n')
        for line in lines[:30]:  # Check first 30 lines for basic info
            if "blood" in line.lower() or "test" in line.lower():
                insights["report_information"]["report_type"] = line.strip()
            if "name:" in line.lower():
                insights["patient_info"]["name"] = line.replace("name:", "", 1).strip()
        
        return insights
    
    except Exception as e:
        logger.error(f"Error in get_health_insights: {str(e)}")
        return {
            "error": "Failed to analyze health report",
            "message": str(e)
        }

@router.get(
    "/reports/{run_id}/parameters/abnormal", 
    response_model=AbnormalParametersResponse,
    responses={
        200: {
            "description": "List of abnormal parameters from the report",
            "content": {
                "application/json": {
                    "example": {
                        "parameters": [
                            {
                                "name": "25-Hydroxy Vitamin D",
                                "value": 9.0,
                                "unit": "ng/mL",
                                "reference_range": "30-100",
                                "direction": "low"
                            },
                            {
                                "name": "TSH - Thyroid Stimulating Hormone",
                                "value": 6.85,
                                "unit": "μIU/mL",
                                "reference_range": "0.35-5.50",
                                "direction": "high"
                            },
                            {
                                "name": "Total Cholesterol",
                                "value": 201,
                                "unit": "mg/dL",
                                "reference_range": "<200",
                                "direction": "high"
                            }
                        ],
                        "report_id": "4febbd52-a731-4ff4-b04a-f0c5e37966fb",
                        "count": 3
                    }
                }
            }
        },
        404: {
            "description": "Report or abnormal parameters not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Report not found for ID: 4febbd52-a731-4ff4-b04a-f0c5e37966fb"}
                }
            }
        }
    }
)
async def get_abnormal_parameters(run_id: str):
    """
    Get abnormal parameters from a specific report
    
    - **run_id**: The unique identifier of the report
    
    Returns:
        Array of abnormal parameters from the report, each containing:
        - name: The parameter name
        - value: The measured value
        - unit: The unit of measurement
        - reference_range: The normal range
        - direction: Whether the value is "high" or "low"
    """
    try:
        # Reuse the existing report loading logic
        report_data = await get_report_by_id(run_id)
        
        # Extract abnormal_parameters
        if not report_data:
            raise HTTPException(
                status_code=404,
                detail=f"Report not found for ID: {run_id}"
            )
            
        logger.info(f"Processing abnormal parameters for report: {run_id}")
        
        # Look for abnormal parameters in the standard location
        if "abnormal_parameters" in report_data and isinstance(report_data["abnormal_parameters"], list):
            abnormal_params = report_data["abnormal_parameters"]
            logger.info(f"Found {len(abnormal_params)} abnormal parameters in report")
            
            # Validate the structure of each abnormal parameter
            validated_params = []
            for param in abnormal_params:
                try:
                    # Handle the case where we have the expected structure
                    if "name" in param and "value" in param and "unit" in param and "reference_range" in param and "direction" in param:
                        validated_param = AbnormalParameter(**param)
                        validated_params.append(validated_param)
                    # Handle alternate structure with test_name and result instead of name and value
                    elif "test_name" in param and "result" in param and "unit" in param and "reference_range" in param:
                        # Map the fields to our expected structure
                        converted_param = {
                            "name": param["test_name"],
                            "value": param["result"],
                            "unit": param["unit"],
                            "reference_range": param["reference_range"],
                            "direction": "low" if "below" in param.get("status", "").lower() else 
                                        "high" if "above" in param.get("status", "").lower() else 
                                        "unknown"
                        }
                        validated_param = AbnormalParameter(**converted_param)
                        validated_params.append(validated_param)
                    else:
                        logger.warning(f"Abnormal parameter has unexpected structure: {param}")
                except Exception as validation_error:
                    logger.warning(f"Invalid abnormal parameter in report {run_id}: {str(validation_error)}")
                    logger.warning(f"Parameter data: {param}")
                    # Skip invalid parameters
                    continue
                    
            return {
                "parameters": validated_params,
                "report_id": run_id,
                "count": len(validated_params)
            }
                
        # If abnormal_parameters not found, look at test_sections for abnormal values
        elif "test_sections" in report_data and isinstance(report_data["test_sections"], list):
            # Extract abnormal parameters from test sections
            abnormal_params = []
            
            for section in report_data["test_sections"]:
                if "parameters" in section and isinstance(section["parameters"], list):
                    for param in section["parameters"]:
                        # Check if parameter is marked as abnormal
                        if param.get("is_abnormal", False):
                            # Determine direction if not specified
                            if "direction" not in param and "value" in param and "reference_range" in param:
                                # Try to determine direction from value and reference range
                                direction = None
                                try:
                                    # Handle numeric values
                                    if isinstance(param["value"], (int, float)):
                                        # Parse reference range
                                        ref_range = str(param["reference_range"])
                                        if "-" in ref_range:
                                            # Range format: min-max
                                            min_val, max_val = ref_range.split("-", 1)
                                            try:
                                                min_val = float(min_val.strip().replace("<", "").replace(">", ""))
                                                max_val = float(max_val.strip().replace("<", "").replace(">", ""))
                                                
                                                if param["value"] < min_val:
                                                    direction = "low"
                                                elif param["value"] > max_val:
                                                    direction = "high"
                                            except ValueError:
                                                # Couldn't convert to float
                                                pass
                                        elif "<" in ref_range:
                                            # Format: < max
                                            try:
                                                max_val = float(ref_range.replace("<", "").strip())
                                                if param["value"] > max_val:
                                                    direction = "high"
                                            except ValueError:
                                                pass
                                        elif ">" in ref_range:
                                            # Format: > min
                                            try:
                                                min_val = float(ref_range.replace(">", "").strip())
                                                if param["value"] < min_val:
                                                    direction = "low"
                                            except ValueError:
                                                pass
                                except:
                                    # Ignore errors in direction determination
                                    pass
                                
                                # Create abnormal parameter with direction
                                abnormal_param = {
                                    "name": param.get("name", "Unknown"),
                                    "value": param.get("value", "N/A"),
                                    "unit": param.get("unit", ""),
                                    "reference_range": param.get("reference_range", ""),
                                    "direction": direction or "unknown"
                                }
                                
                                try:
                                    validated_param = AbnormalParameter(**abnormal_param)
                                    abnormal_params.append(validated_param)
                                except Exception:
                                    # Skip invalid parameters
                                    continue
                                    
            if abnormal_params:
                return {
                    "parameters": abnormal_params,
                    "report_id": run_id,
                    "count": len(abnormal_params)
                }
                
        # No abnormal parameters found
        logger.info(f"No abnormal parameters found in report: {run_id}")
        return {
            "parameters": [],
            "report_id": run_id,
            "count": 0
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error retrieving abnormal parameters for run_id {run_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving abnormal parameters: {str(e)}"
        ) 