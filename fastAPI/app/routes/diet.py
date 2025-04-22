"""
Diet routes for meal planning recommendations
"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.services import diet_service
from app.models.schemas import MealPlanResponse

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/diet",
    tags=["Diet"]
)

@router.get("/meal-plan", response_model=MealPlanResponse)
async def meal_plan(
    run_id: str = Query(..., description="Unique identifier for the health analysis run"),
    preferences: Optional[str] = Query(None, description="Comma-separated list of dietary preferences (e.g., 'vegetarian,low-carb')")
):
    """
    Get personalized meal plan recommendations based on health analysis
    
    - **run_id**: Required unique identifier for the health analysis run
    - **preferences**: Optional comma-separated dietary preferences (e.g., 'vegetarian,low-carb')
    
    Returns a meal plan with breakfast, lunch, dinner, and snack options.
    """
    try:
        return diet_service.get_mock_meal_plan(run_id, preferences)
    except Exception as e:
        logger.error(f"Error generating meal plan for run_id {run_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate meal plan: {str(e)}"
        ) 