"""
MongoDB Context Manager for handling request tracking and analytics
"""

import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import Request
from contextlib import asynccontextmanager

from app.database.mongo_client import get_database

logger = logging.getLogger(__name__)

@asynccontextmanager
async def mongodb_request_context(
    request: Request, 
    resource_type: str, 
    operation: str, 
    resource_id: Optional[str] = None
):
    """
    Async context manager for tracking MongoDB operations
    
    Args:
        request: FastAPI request object
        resource_type: Type of resource being accessed (e.g., "parameter", "report")
        operation: Operation being performed (e.g., "read", "write", "query")
        resource_id: Optional ID of the resource
        
    Yields:
        Context dictionary with request information and timing
    """
    try:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        user_id = request.headers.get("x-user-id", "anonymous")
        
        # Create context dictionary with request information
        context = {
            "request_id": request.headers.get("x-request-id", f"{int(time.time()*1000)}"),
            "client_ip": client_ip,
            "user_agent": user_agent,
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "operation": operation,
            "start_time": start_time,
            "request_path": request.url.path,
            "query_params": dict(request.query_params),
        }
        
        logger.info(
            f"Starting {operation} operation on {resource_type}" + 
            (f" (ID: {resource_id})" if resource_id else "")
        )
        
        # Execute the operation within the context
        try:
            yield context
            
            # Calculate duration after operation completes
            duration = time.time() - start_time
            context["duration"] = duration
            context["success"] = True
            
            logger.info(
                f"Completed {operation} operation on {resource_type} in {duration:.2f}s" +
                (f" (ID: {resource_id})" if resource_id else "")
            )
            
            # Record analytics asynchronously
            await record_analytics(context)
            
        except Exception as e:
            # Calculate duration after operation fails
            duration = time.time() - start_time
            context["duration"] = duration
            context["success"] = False
            context["error"] = str(e)
            
            logger.error(
                f"Error in {operation} operation on {resource_type}" +
                (f" (ID: {resource_id})" if resource_id else "") +
                f": {str(e)}"
            )
            
            # Record failed operation analytics
            await record_analytics(context)
            
            # Re-raise the exception
            raise
    except Exception as e:
        # Special handling during OpenAPI schema generation or when request object is not available
        # (this happens during OpenAPI generation)
        logger.debug(f"Context tracking skipped: {str(e)}")
        # Create a minimal context for OpenAPI schema generation
        context = {
            "resource_type": resource_type,
            "operation": operation,
            "resource_id": resource_id,
            "skip_tracking": True
        }
        # Yield the minimal context
        yield context

async def record_analytics(context: Dict[str, Any]):
    """
    Record analytics data to MongoDB
    
    Args:
        context: Context dictionary with request information
    """
    # Skip recording if this is a minimal context (e.g., during OpenAPI schema generation)
    if context.get("skip_tracking", False):
        return
        
    try:
        db = await get_database()
        # Add timestamp for when analytics record is created
        context["recorded_at"] = datetime.utcnow()
        
        # Insert analytics document
        await db.analytics.insert_one(context)
    except Exception as e:
        # Log the error but don't fail the request
        logger.error(f"Failed to record analytics: {str(e)}") 