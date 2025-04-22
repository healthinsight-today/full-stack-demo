from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any, List
from app.services.mcp_service import (
    MCPService, 
    MCPContext, 
    MCPRequest, 
    MCPResponse, 
    MCPMessage
)
from pydantic import BaseModel

router = APIRouter(
    prefix="/mcp",
    tags=["mcp"],
)

# Helper to get the MCP service instance
def get_mcp_service():
    return MCPService()

# Additional models for API requests/responses
class CreateContextRequest(BaseModel):
    system_message: Optional[str] = None
    
class AddMessageRequest(BaseModel):
    role: str
    content: str
    
class GenerateRequest(BaseModel):
    provider: Optional[str] = None
    model: Optional[str] = None 
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    options: Dict[str, Any] = {}
    
class StatusResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

@router.post("/contexts", response_model=MCPContext)
async def create_context(
    request: CreateContextRequest, 
    mcp_service: MCPService = Depends(get_mcp_service)
):
    """
    Create a new conversation context
    
    - **system_message**: Optional system message to initialize the context
    """
    return mcp_service.create_context(system_message=request.system_message)

@router.post("/contexts/{context_id}/messages", response_model=MCPContext)
async def add_message(
    context_id: str, 
    request: AddMessageRequest,
    mcp_service: MCPService = Depends(get_mcp_service)
):
    """
    Add a message to an existing context
    
    - **context_id**: ID of the context to update
    - **role**: Role of the message sender (system, user, assistant)
    - **content**: Content of the message
    """
    try:
        # Since we're not storing contexts in memory/database in this example,
        # we'll return an error. In a real application, you would retrieve the
        # context from a database using the context_id.
        raise HTTPException(
            status_code=404, 
            detail=f"Context with ID {context_id} not found. In this example, you need to provide the full context in the request."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate", response_model=MCPResponse)
async def generate_response(
    request: MCPRequest,
    mcp_service: MCPService = Depends(get_mcp_service)
):
    """
    Generate a response using the specified context and settings
    
    - **context**: Conversation context
    - **provider**: Optional LLM provider to use
    - **model**: Optional model name to use
    - **temperature**: Optional temperature for generation
    - **max_tokens**: Optional maximum tokens to process
    - **output_tokens**: Optional maximum tokens for response
    - **options**: Additional provider-specific options
    """
    try:
        return mcp_service.generate_response(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/contexts/{context_id}/generate", response_model=MCPResponse)
async def generate_from_context(
    context_id: str,
    request: GenerateRequest,
    mcp_service: MCPService = Depends(get_mcp_service)
):
    """
    Generate a response from an existing context
    
    - **context_id**: ID of the context to use
    - **provider**: Optional LLM provider to use
    - **model**: Optional model name to use
    - **temperature**: Optional temperature for generation
    - **max_tokens**: Optional maximum tokens to process
    - **output_tokens**: Optional maximum tokens for response
    - **options**: Additional provider-specific options
    """
    try:
        # Since we're not storing contexts in memory/database in this example,
        # we'll return an error. In a real application, you would retrieve the
        # context from a database using the context_id.
        raise HTTPException(
            status_code=404, 
            detail=f"Context with ID {context_id} not found. In this example, you need to provide the full context in the request."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status", response_model=StatusResponse)
async def get_status():
    """
    Get the status of the MCP API
    """
    return StatusResponse(
        status="success",
        message="MCP API is operational",
        data={
            "version": "1.0.0",
            "supported_providers": ["openai", "anthropic", "xai"],
            "endpoints": [
                "/mcp/contexts",
                "/mcp/contexts/{context_id}/messages",
                "/mcp/generate",
                "/mcp/contexts/{context_id}/generate",
                "/mcp/status"
            ]
        }
    ) 