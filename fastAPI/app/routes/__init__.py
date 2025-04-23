"""
API routes for Health Insight Today
"""

from fastapi import APIRouter

from app.config import settings
from app.routes import (
    base,
    health_check,
    pdf,
    ocr,
    mcp,
    health_analysis,
    documents,
    auth,  # Import auth routes
    parameters,  # Import parameter routes
    # More routes will be added here
)

# Create main API router
api_router = APIRouter(prefix=settings.API_PREFIX)

# Include all route modules
api_router.include_router(base.router, prefix="/base")
api_router.include_router(health_check.router, prefix="/health")
api_router.include_router(pdf.router, prefix="/pdf")
api_router.include_router(ocr.router, prefix="/ocr")
api_router.include_router(mcp.router, prefix="/mcp")
api_router.include_router(health_analysis.router, prefix="/health")
api_router.include_router(documents.router, prefix="/documents")
api_router.include_router(auth.router, prefix="/auth")  # Add auth routes
api_router.include_router(parameters.router, prefix="/parameters")  # Add parameter routes

# Export the main router
__all__ = ["api_router"] 