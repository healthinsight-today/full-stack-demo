"""
Diet service for meal planning recommendations
"""

import json
import logging
import os
import datetime
from typing import Dict, Any, Optional
from pathlib import Path

from app.config import settings
from app.models.schemas import MealPlanResponse, MealSlot

# Configure logger
logger = logging.getLogger(__name__)

def get_report_data(run_id: str) -> Dict[str, Any]:
    """
    Load the analysis data for a given run_id
    """
    try:
        analysis_file = Path(settings.PROCESSED_DIR) / f"{run_id}_analysis.json"
        if not analysis_file.exists():
            logger.warning(f"Analysis file not found for run_id: {run_id}")
            return {}
        
        with open(analysis_file, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading analysis data for run_id {run_id}: {e}")
        return {}

def get_mock_meal_plan(run_id: str, preferences: Optional[str] = None) -> MealPlanResponse:
    """
    Generate a mock meal plan based on run_id and preferences
    
    Args:
        run_id: The unique identifier for the analysis run
        preferences: Optional dietary preferences (comma-separated)
    
    Returns:
        MealPlanResponse with mock meal plan data
    """
    # Load the original analysis to get user_id and medical_report_id
    report_data = get_report_data(run_id)
    user_id = report_data.get("patient_information", {}).get("patient_id", None)
    medical_report_id = report_data.get("patient_information", {}).get("registration_no", None)
    
    # Parse preferences if provided
    preference_list = []
    if preferences:
        preference_list = [p.strip().lower() for p in preferences.split(",")]
    
    # Check if 'vegetarian' is in preferences
    is_vegetarian = any(p in ["vegetarian", "veg", "plant-based"] for p in preference_list)
    is_low_carb = any(p in ["low-carb", "keto", "low carb"] for p in preference_list)
    
    # Create mock meal plan
    meal_plan = []
    
    # Breakfast
    breakfast = MealSlot(
        meal_type="Breakfast",
        foods=[
            "Steel-cut oatmeal with berries" if not is_low_carb else "Greek yogurt with nuts and berries",
            "Hard-boiled eggs" if not is_vegetarian else "Tofu scramble",
            "Green tea"
        ],
        calories=350,
        nutrition_info={
            "protein": "15g",
            "carbs": "45g" if not is_low_carb else "15g",
            "fat": "12g"
        },
        preparation_notes="Prepare oatmeal with water or almond milk. Add fresh berries and a tablespoon of honey if desired."
    )
    meal_plan.append(breakfast)
    
    # Lunch
    lunch_foods = []
    if is_vegetarian:
        lunch_foods = [
            "Quinoa bowl with roasted vegetables",
            "Mixed greens salad with olive oil dressing",
            "Fresh fruit"
        ]
    else:
        lunch_foods = [
            "Grilled chicken breast" if not is_low_carb else "Grilled chicken thigh with skin",
            "Steamed broccoli and carrots",
            "Brown rice" if not is_low_carb else "Cauliflower rice"
        ]
    
    lunch = MealSlot(
        meal_type="Lunch",
        foods=lunch_foods,
        calories=450,
        nutrition_info={
            "protein": "30g",
            "carbs": "40g" if not is_low_carb else "10g",
            "fat": "15g" if not is_low_carb else "25g"
        }
    )
    meal_plan.append(lunch)
    
    # Dinner
    dinner_foods = []
    if is_vegetarian:
        dinner_foods = [
            "Lentil soup" if not is_low_carb else "Vegetable and tofu stir-fry",
            "Whole grain bread" if not is_low_carb else "Side salad with avocado",
            "Steamed vegetables"
        ]
    else:
        dinner_foods = [
            "Baked salmon fillet",
            "Roasted sweet potatoes" if not is_low_carb else "Roasted Brussels sprouts",
            "Asparagus"
        ]
    
    dinner = MealSlot(
        meal_type="Dinner",
        foods=dinner_foods,
        calories=500,
        nutrition_info={
            "protein": "35g",
            "carbs": "35g" if not is_low_carb else "15g",
            "fat": "20g"
        }
    )
    meal_plan.append(dinner)
    
    # Snack
    snack = MealSlot(
        meal_type="Snack",
        foods=[
            "Apple with almond butter" if not is_low_carb else "Celery with almond butter",
            "Mixed nuts",
            "Water"
        ],
        calories=180,
        nutrition_info={
            "protein": "5g",
            "carbs": "15g" if not is_low_carb else "5g",
            "fat": "12g"
        }
    )
    meal_plan.append(snack)
    
    # Create metadata
    now = datetime.datetime.now()
    metadata = {
        "generated_at": now.isoformat(),
        "preferences": preference_list,
        "total_calories": 1480 if not is_low_carb else 1280,
        "plan_type": "regular" if not is_low_carb else "low-carb",
        "dietary_style": "vegetarian" if is_vegetarian else "omnivore"
    }
    
    # Create response
    response = MealPlanResponse(
        run_id=run_id,
        user_id=user_id,
        medical_report_id=medical_report_id,
        metadata=metadata,
        meal_plan=meal_plan
    )
    
    return response 