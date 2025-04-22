"""
Shopping routes for grocery and supplement recommendations
"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.services import grocery_service
from app.models.schemas import GroceryResponse

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/shopping",
    tags=["Shopping"]
)

@router.get("/grocery-recommendations", response_model=GroceryResponse)
async def groceries(
    run_id: str = Query(..., description="Unique identifier for the health analysis run"),
    location: str = Query(..., description="User's location for location-specific recommendations")
):
    """
    Get personalized grocery recommendations based on health analysis
    
    - **run_id**: Required unique identifier for the health analysis run
    - **location**: Required user's location for region-specific recommendations
    
    Returns a list of recommended grocery items with categories and notes.
    """
    try:
        return grocery_service.get_mock_groceries(run_id, location)
    except Exception as e:
        logger.error(f"Error generating grocery recommendations for run_id {run_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate grocery recommendations: {str(e)}"
        ) 