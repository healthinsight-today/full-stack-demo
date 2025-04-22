"""
Specialists routes for healthcare provider recommendations
"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.services import specialist_service
from app.models.schemas import SpecialistsResponse

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/specialists",
    tags=["Specialists"]
)

@router.get("", response_model=SpecialistsResponse)
async def specialists(
    run_id: str = Query(..., description="Unique identifier for the health analysis run"),
    specialty: Optional[str] = Query(None, description="Optional medical specialty to filter by (e.g., 'cardiologist')"),
    location: str = Query(..., description="User's location for finding nearby specialists")
):
    """
    Get healthcare specialist recommendations based on health analysis
    
    - **run_id**: Required unique identifier for the health analysis run
    - **specialty**: Optional medical specialty to filter by (e.g., 'cardiologist')
    - **location**: Required user's location for finding nearby specialists
    
    Returns a list of healthcare specialists with contact information and availability.
    """
    try:
        return specialist_service.get_mock_specialists(run_id, specialty, location)
    except Exception as e:
        logger.error(f"Error generating specialist recommendations for run_id {run_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate specialist recommendations: {str(e)}"
        ) 