"""
Context middleware for automatic context tracking in all API requests
"""

import time
import logging
from typing import Callable, Dict, Any
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import FastAPI

from app.database.mongo_client import get_database

logger = logging.getLogger(__name__)

class ContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware to automatically track request context for all API endpoints
    
    This middleware adds context tracking to every API request, recording
    basic request information and timing data in MongoDB.
    """
    
    def __init__(self, app: FastAPI):
        """
        Initialize the middleware
        
        Args:
            app: FastAPI application
        """
        super().__init__(app)
    
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Any]
    ) -> Response:
        """
        Process the request and add context tracking
        
        Args:
            request: FastAPI request object
            call_next: Function to call next middleware
            
        Returns:
            Response from the API
        """
        # Start timing and collect basic request info
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        request_id = request.headers.get("x-request-id", f"{int(time.time()*1000)}")
        
        # Get user ID from header if authenticated
        user_id = request.headers.get("x-user-id", "anonymous")
        
        # Create request context
        context = {
            "request_id": request_id,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "user_id": user_id,
            "path": request.url.path,
            "method": request.method,
            "query_params": dict(request.query_params),
            "start_time": start_time,
            "timestamp": datetime.utcnow()
        }
        
        # Attach context to request state for access in route handlers
        request.state.context = context
        
        # Add request ID to response headers
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        # Calculate request duration
        duration = time.time() - start_time
        context["duration"] = duration
        
        # Record request in MongoDB asynchronously if not a health check
        if not request.url.path.endswith("/health") and not request.url.path.endswith("/ping"):
            try:
                await self._record_request(
                    context=context,
                    status_code=response.status_code
                )
            except Exception as e:
                logger.error(f"Failed to record request: {e}")
        
        return response
    
    async def _record_request(self, context: Dict[str, Any], status_code: int) -> None:
        """
        Record request details in MongoDB
        
        Args:
            context: Request context
            status_code: HTTP status code
        """
        try:
            # Get MongoDB database
            db = await get_database()
            
            # Add status code to context
            context["status_code"] = status_code
            context["success"] = 200 <= status_code < 300
            
            # Insert request into MongoDB
            await db.request_logs.insert_one(context)
        except Exception as e:
            logger.error(f"Failed to record request: {e}")

def setup_context_middleware(app: FastAPI) -> None:
    """
    Setup context middleware for FastAPI application
    
    Args:
        app: FastAPI application
    """
    # Add the middleware
    app.add_middleware(ContextMiddleware)
    
    logger.info("Context middleware initialized successfully") 