"""
Base context middleware for all API endpoints to use MongoDB context
"""

import logging
from typing import Dict, Any, Optional, Callable, Awaitable, Type
from datetime import datetime
from fastapi import Request, Depends

from app.middleware.mongodb_context import mongodb_request_context
from app.database.mongo_client import get_database

logger = logging.getLogger(__name__)

class BaseContextManager:
    """
    Base context manager for all API operations
    
    This class provides a foundation for implementing context-aware
    operations across all API endpoints. It handles MongoDB context
    management and operation tracking.
    """
    
    # Resource type should be overridden by subclasses
    RESOURCE_TYPE = "base"
    
    def __init__(self, request: Request):
        """
        Initialize the context manager with a request
        
        Args:
            request: FastAPI request object
        """
        self.request = request
    
    async def with_context(
        self, 
        operation: str, 
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        handler: Optional[Callable[[Dict[str, Any]], Awaitable[Any]]] = None
    ) -> Dict[str, Any]:
        """
        Execute an operation within MongoDB context
        
        Args:
            operation: Operation being performed
            resource_id: Optional ID of the resource
            details: Optional operation details
            handler: Optional callback function to process context
            
        Returns:
            Context dictionary or handler result
        """
        try:
            async with mongodb_request_context(
                request=self.request,
                resource_type=self.RESOURCE_TYPE,
                operation=operation,
                resource_id=resource_id
            ) as context:
                # Skip recording for schema generation
                if context.get("skip_tracking", False):
                    if handler:
                        return await handler(context)
                    return context
                
                # Add operation details if provided
                if details:
                    context["details"] = details
                
                # Record operation in MongoDB
                try:
                    await self._record_operation(context, operation, details or {})
                except Exception as e:
                    logger.error(f"Failed to record operation: {e}")
                
                # Call handler with context if provided
                if handler:
                    result = await handler(context)
                    return result
                
                return context
        except Exception as e:
            logger.error(f"Error in context manager: {str(e)}")
            # Return minimal context during errors (e.g., OpenAPI generation)
            return {
                "resource_type": self.RESOURCE_TYPE,
                "operation": operation,
                "resource_id": resource_id,
                "error": str(e),
                "skip_tracking": True
            }
    
    async def _record_operation(
        self, 
        context: Dict[str, Any], 
        operation: str, 
        details: Dict[str, Any]
    ) -> None:
        """
        Record operation details in MongoDB
        
        Args:
            context: MongoDB context
            operation: Operation being performed
            details: Operation details
        """
        # Skip recording if this is a minimal context
        if context.get("skip_tracking", False):
            return
            
        try:
            # Get MongoDB database
            db = await get_database()
            
            # Create operation record
            operation_record = {
                "resource_type": self.RESOURCE_TYPE,
                "operation": operation,
                "details": details,
                "context": context,
                "user_id": context.get("user_id", "anonymous"),
                "client_ip": context.get("client_ip", "unknown"),
                "user_agent": context.get("user_agent", "unknown"),
                "timestamp": datetime.utcnow(),
                "duration": context.get("duration", 0),
                "success": context.get("success", True)
            }
            
            # Insert operation record
            await db.operation_logs.insert_one(operation_record)
        except Exception as e:
            logger.error(f"Failed to record operation: {e}")

def get_context_manager(context_class: Type[BaseContextManager]):
    """
    Create a dependency provider for a specific context manager type
    
    Args:
        context_class: Context manager class to instantiate
        
    Returns:
        Dependency function that provides the context manager
    """
    def get_instance(request: Request) -> BaseContextManager:
        return context_class(request)
    
    return get_instance

# Example of health context manager
class HealthContextManager(BaseContextManager):
    """Health-related operations context manager"""
    RESOURCE_TYPE = "health"

# Example of document context manager
class DocumentContextManager(BaseContextManager):
    """Document operations context manager"""
    RESOURCE_TYPE = "document"

# Example of auth context manager
class AuthContextManager(BaseContextManager):
    """Auth operations context manager"""
    RESOURCE_TYPE = "auth"

# Pre-configured dependency providers
get_health_context = get_context_manager(HealthContextManager)
get_document_context = get_context_manager(DocumentContextManager)
get_auth_context = get_context_manager(AuthContextManager) 