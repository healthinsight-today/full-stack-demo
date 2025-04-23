"""
Health check endpoints
"""

from fastapi import APIRouter, Request, Depends
from app.config import settings
from app.middleware.mongodb_context import mongodb_request_context
from app.middleware.base_context import BaseContextManager, get_context_manager
from app.database.mongo_client import get_database

router = APIRouter(
    tags=["System"]
)

class HealthContextManager(BaseContextManager):
    """Health check context manager"""
    RESOURCE_TYPE = "health"
    
    async def check_health(self) -> dict:
        """Check system health within MongoDB context"""
        return await self.with_context("check", details={"check_type": "api_health"})

# Create dependency provider
get_health_context = get_context_manager(HealthContextManager)

@router.get("/health")
async def health_check(
    request: Request,
    health_context: HealthContextManager = Depends(get_health_context)
):
    """
    API health check - checks all components including MongoDB context
    
    Returns:
        dict: Health status with version, environment, and database status
    """
    # Basic health check response
    response = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENV
    }
    
    # Check MongoDB context system
    async with mongodb_request_context(
        request=request, 
        resource_type="health", 
        operation="check"
    ) as context:
        try:
            # Use the context manager to record the health check
            await health_context.check_health()
            
            # Check MongoDB connection
            db = await get_database()
            await db.command("ping")
            response["database"] = "connected"
            response["context_system"] = "operational"
        except Exception as e:
            response["status"] = "degraded"
            response["database"] = f"error: {str(e)}"
            response["context_system"] = "error"
    
    return response

@router.get("/ping")
async def ping():
    """Simple ping endpoint for load balancers"""
    return {"ping": "pong"} 