"""
Health check endpoints
"""

from fastapi import APIRouter
from app.config import settings

router = APIRouter(
    tags=["System"]
)

@router.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENV
    } 