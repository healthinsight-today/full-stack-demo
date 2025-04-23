"""
Parameter context service for managing parameter operations with MongoDB context
"""

import logging
from typing import Dict, Any, Optional, Callable, Awaitable
from datetime import datetime
from fastapi import Request, Depends

from app.middleware.mongodb_context import mongodb_request_context
from app.database.mongo_client import get_database

logger = logging.getLogger(__name__)

async def with_mongodb_context(
    request: Request,
    resource_type: str,
    operation: str,
    resource_id: Optional[str] = None,
    handler: Optional[Callable[[Dict[str, Any]], Awaitable[Any]]] = None
) -> Dict[str, Any]:
    """
    Execute an operation within MongoDB context and handle the results
    
    Args:
        request: FastAPI request object
        resource_type: Type of resource being accessed
        operation: Operation being performed
        resource_id: Optional resource ID
        handler: Optional callback function to process context
        
    Returns:
        Result from the handler or context dictionary
    """
    async with mongodb_request_context(
        request=request,
        resource_type=resource_type,
        operation=operation,
        resource_id=resource_id
    ) as context:
        if handler:
            return await handler(context)
        return context

class ParameterContextManager:
    """
    Context manager for parameter operations using MongoDB context
    """
    
    def __init__(self, request: Request):
        """
        Initialize the context manager with a request
        
        Args:
            request: FastAPI request object
        """
        self.request = request
        
    async def list_parameters(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        List parameters within MongoDB context
        
        Args:
            filters: Dictionary of filter parameters
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter",
            operation="list",
            handler=lambda ctx: self._record_parameter_operation(ctx, "list", filters)
        )
    
    async def get_parameter(self, parameter_id: str) -> Dict[str, Any]:
        """
        Get parameter by ID within MongoDB context
        
        Args:
            parameter_id: Parameter ID
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter",
            operation="get",
            resource_id=parameter_id,
            handler=lambda ctx: self._record_parameter_operation(ctx, "get", {"parameter_id": parameter_id})
        )
    
    async def get_parameter_by_name(self, parameter_name: str) -> Dict[str, Any]:
        """
        Get parameter by name within MongoDB context
        
        Args:
            parameter_name: Parameter name
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter",
            operation="get_by_name",
            resource_id=parameter_name,
            handler=lambda ctx: self._record_parameter_operation(ctx, "get_by_name", {"parameter_name": parameter_name})
        )
    
    async def get_parameter_history(self, parameter_name: str, user_id: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get parameter history within MongoDB context
        
        Args:
            parameter_name: Parameter name
            user_id: User ID
            filters: Dictionary of filter parameters
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter_history",
            operation="get",
            resource_id=f"{user_id}:{parameter_name}",
            handler=lambda ctx: self._record_parameter_operation(
                ctx, 
                "get_history", 
                {
                    "parameter_name": parameter_name,
                    "user_id": user_id,
                    **filters
                }
            )
        )
    
    async def query_parameter_history(self, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Query parameter history within MongoDB context
        
        Args:
            query_params: Query parameters
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter_history",
            operation="query",
            handler=lambda ctx: self._record_parameter_operation(ctx, "query_history", query_params)
        )
    
    async def create_parameter(self, parameter_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create parameter within MongoDB context
        
        Args:
            parameter_data: Parameter data
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter",
            operation="create",
            handler=lambda ctx: self._record_parameter_operation(ctx, "create", parameter_data)
        )
    
    async def update_parameter(self, parameter_id: str, parameter_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update parameter within MongoDB context
        
        Args:
            parameter_id: Parameter ID
            parameter_data: Updated parameter data
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter",
            operation="update",
            resource_id=parameter_id,
            handler=lambda ctx: self._record_parameter_operation(
                ctx, 
                "update", 
                {
                    "parameter_id": parameter_id,
                    **parameter_data
                }
            )
        )
    
    async def delete_parameter(self, parameter_id: str) -> Dict[str, Any]:
        """
        Delete parameter within MongoDB context
        
        Args:
            parameter_id: Parameter ID
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter",
            operation="delete",
            resource_id=parameter_id,
            handler=lambda ctx: self._record_parameter_operation(ctx, "delete", {"parameter_id": parameter_id})
        )
    
    async def record_parameter_usage(self, parameter_name: str, user_id: str) -> Dict[str, Any]:
        """
        Record parameter usage within MongoDB context
        
        Args:
            parameter_name: Parameter name
            user_id: User ID
            
        Returns:
            Context with operation details
        """
        return await with_mongodb_context(
            request=self.request,
            resource_type="parameter_usage",
            operation="record",
            resource_id=f"{user_id}:{parameter_name}",
            handler=lambda ctx: self._record_parameter_operation(
                ctx, 
                "record_usage", 
                {
                    "parameter_name": parameter_name,
                    "user_id": user_id
                }
            )
        )
    
    async def _record_parameter_operation(self, context: Dict[str, Any], operation_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Record parameter operation details
        
        Args:
            context: MongoDB context
            operation_type: Type of operation
            details: Operation details
            
        Returns:
            Updated context
        """
        try:
            # Add operation details to context
            context["operation_type"] = operation_type
            context["operation_details"] = details
            context["timestamp"] = datetime.utcnow()
            
            # Record detailed operation log in MongoDB
            db = await get_database()
            await db.parameter_operations.insert_one({
                **context,
                "created_at": datetime.utcnow()
            })
            
            return context
        except Exception as e:
            logger.error(f"Failed to record parameter operation: {e}")
            return context

def get_parameter_context(request: Request) -> ParameterContextManager:
    """
    Dependency for getting parameter context manager
    
    Args:
        request: FastAPI request object
        
    Returns:
        ParameterContextManager instance
    """
    return ParameterContextManager(request) 