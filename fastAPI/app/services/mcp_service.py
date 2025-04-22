"""
Model Context Protocol (MCP) service implementation
"""

from typing import Dict, Any, Optional, List, Union
import json
import time
import logging
from pydantic import BaseModel, Field
import uuid

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.config import settings
from app.services.llm_providers.factory import provider_factory

logger = logging.getLogger(__name__)

class MCPMessage(BaseModel):
    """Model representing a message in the Model Context Protocol"""
    role: str = Field(..., description="Role of the message sender (system, user, assistant)")
    content: str = Field(..., description="Content of the message")
    timestamp: Optional[float] = Field(default_factory=time.time, description="Unix timestamp when the message was created")
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique message identifier")

class MCPContext(BaseModel):
    """Model representing the context in the Model Context Protocol"""
    messages: List[MCPMessage] = Field(default_factory=list, description="List of messages in the conversation")
    context_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique context identifier")
    created_at: float = Field(default_factory=time.time, description="Unix timestamp when the context was created")
    updated_at: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the context")

class MCPRequest(BaseModel):
    """Model representing a request in the Model Context Protocol"""
    context: MCPContext = Field(..., description="Context for the request")
    model: Optional[str] = Field(None, description="Model to use for this request")
    provider: Optional[str] = Field(None, description="Provider to use for this request")
    temperature: Optional[float] = Field(None, description="Temperature for generation")
    max_tokens: Optional[int] = Field(None, description="Maximum input tokens to process")
    output_tokens: Optional[int] = Field(None, description="Maximum tokens for response")
    options: Dict[str, Any] = Field(default_factory=dict, description="Additional provider-specific options")

class MCPResponse(BaseModel):
    """Model representing a response in the Model Context Protocol"""
    message: MCPMessage = Field(..., description="Generated message")
    context: MCPContext = Field(..., description="Updated context after generation")
    model: str = Field(..., description="Model used for generation")
    provider: str = Field(..., description="Provider used for generation")
    usage: Dict[str, Any] = Field(default_factory=dict, description="Token usage information")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the response")

class MCPService:
    """Service for the Model Context Protocol"""
    
    def create_context(self, system_message: Optional[str] = None) -> MCPContext:
        """
        Create a new conversation context
        
        Args:
            system_message: Optional system message to initialize the context
            
        Returns:
            New MCPContext object
        """
        context = MCPContext()
        
        # Add system message if provided
        if system_message:
            context.messages.append(
                MCPMessage(role="system", content=system_message)
            )
            
        return context
    
    def add_message(self, context: MCPContext, role: str, content: str) -> MCPContext:
        """
        Add a message to an existing context
        
        Args:
            context: The context to update
            role: Role of the message sender (system, user, assistant)
            content: Content of the message
            
        Returns:
            Updated MCPContext
        """
        # Create a copy of the context to avoid modifying the original
        updated_context = MCPContext(**context.dict())
        
        # Add the new message
        updated_context.messages.append(
            MCPMessage(role=role, content=content)
        )
        
        # Update timestamp
        updated_context.updated_at = time.time()
        
        return updated_context
    
    def _convert_to_langchain_messages(self, context: MCPContext):
        """
        Convert MCP context to LangChain message format
        
        Args:
            context: MCP context to convert
            
        Returns:
            List of LangChain messages
        """
        langchain_messages = []
        
        for msg in context.messages:
            if msg.role == "system":
                langchain_messages.append(SystemMessage(content=msg.content))
            elif msg.role == "user":
                langchain_messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                langchain_messages.append(AIMessage(content=msg.content))
                
        return langchain_messages
    
    async def generate_response(self, request: MCPRequest) -> MCPResponse:
        """
        Generate a response using the specified context and settings
        
        Args:
            request: MCP request object
            
        Returns:
            MCP response object
        """
        try:
            # Get provider
            provider_name = request.provider or settings.DEFAULT_PROVIDER
            provider = provider_factory.get_provider(provider_name)
            
            # Convert context to LangChain format
            langchain_messages = self._convert_to_langchain_messages(request.context)
            
            # Generate response
            try:
                response = await provider.generate(
                    messages=langchain_messages,
                    model=request.model,
                    temperature=request.temperature or settings.LLM_TEMPERATURE,
                    max_tokens=request.output_tokens,
                    **request.options
                )
                
            except Exception as e:
                logger.error(f"Error generating response: {str(e)}")
                raise
            
            # Create response message
            response_message = MCPMessage(
                role="assistant",
                content=response["content"]
            )
            
            # Update context with response
            updated_context = self.add_message(
                request.context, 
                "assistant", 
                response["content"]
            )
            
            # Create MCP response
            return MCPResponse(
                message=response_message,
                context=updated_context,
                model=response["model"],
                provider=provider_name,
                usage=response["usage"],
                metadata={
                    **response["metadata"],
                    "template_version": request.context.metadata.get("template_version")
                }
            )
            
        except Exception as e:
            logger.error(f"Error in generate_response: {str(e)}")
            
            # Create emergency fallback response
            fallback_message = MCPMessage(
                role="assistant", 
                content=f"I apologize, but I encountered an error: {str(e)}"
            )
            
            # Copy the original context
            from copy import deepcopy
            fallback_context = deepcopy(request.context)
            
            # Add error message
            fallback_context.messages.append(fallback_message)
            fallback_context.updated_at = time.time()
            
            # Return graceful error response
            return MCPResponse(
                message=fallback_message,
                context=fallback_context,
                model=request.model or "fallback",
                provider=request.provider or "error",
                usage={},
                metadata={"error": str(e)}
            )
    
    def save_context(self, context: MCPContext, file_path: Optional[str] = None) -> str:
        """
        Save context to a file or return as JSON string
        
        Args:
            context: Context to save
            file_path: Optional file path to save to
            
        Returns:
            Path to saved file or JSON string
        """
        context_json = context.json(indent=2)
        
        if file_path:
            with open(file_path, "w") as f:
                f.write(context_json)
            return file_path
        
        return context_json
    
    def load_context(self, source: str) -> MCPContext:
        """
        Load context from a file or JSON string
        
        Args:
            source: File path or JSON string
            
        Returns:
            Loaded MCPContext
        """
        try:
            # Try to load as file first
            with open(source, "r") as f:
                context_json = f.read()
        except (FileNotFoundError, IsADirectoryError):
            # If not a file, assume it's a JSON string
            context_json = source
            
        return MCPContext.parse_raw(context_json) 