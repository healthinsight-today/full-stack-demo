"""
Grocery service for shopping recommendations
"""

import json
import logging
import os
import datetime
from typing import Dict, Any, List
from pathlib import Path

from app.config import settings
from app.models.schemas import GroceryResponse, GroceryItem

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

def get_location_specific_items(location: str) -> List[GroceryItem]:
    """
    Get location-specific grocery items
    
    Args:
        location: User's location for regional recommendations
        
    Returns:
        List of location-specific grocery items
    """
    # Create a basic mapping of locations to region-specific grocery items
    location_items = {
        "northeast": [
            GroceryItem(
                name="Maine Wild Blueberries",
                category="Produce",
                quantity="1 pint",
                notes="High in antioxidants, locally sourced"
            ),
            GroceryItem(
                name="Vermont Maple Syrup",
                category="Sweeteners",
                quantity="8 oz bottle",
                notes="Natural sweetener, use sparingly"
            )
        ],
        "southeast": [
            GroceryItem(
                name="Florida Oranges",
                category="Produce",
                quantity="5 count bag",
                notes="High in vitamin C, locally grown"
            ),
            GroceryItem(
                name="Georgia Peaches",
                category="Produce",
                quantity="4 count",
                notes="In season during summer months"
            )
        ],
        "midwest": [
            GroceryItem(
                name="Wisconsin Cheese",
                category="Dairy",
                quantity="8 oz block",
                notes="Local artisanal cheese, high in calcium"
            ),
            GroceryItem(
                name="Michigan Cherries",
                category="Produce",
                quantity="1 lb bag",
                notes="Great for snacking or baking"
            )
        ],
        "southwest": [
            GroceryItem(
                name="New Mexico Green Chiles",
                category="Produce",
                quantity="1 lb",
                notes="Add to eggs or roast for flavor"
            ),
            GroceryItem(
                name="Texas Ruby Red Grapefruit",
                category="Produce",
                quantity="3 count",
                notes="High in vitamin C and fiber"
            )
        ],
        "west": [
            GroceryItem(
                name="California Avocados",
                category="Produce",
                quantity="3 count",
                notes="Rich in healthy fats and potassium"
            ),
            GroceryItem(
                name="Washington Apples",
                category="Produce",
                quantity="5 count bag",
                notes="High in fiber and antioxidants"
            )
        ]
    }
    
    # Normalize location input
    location_lower = location.lower()
    
    # Find matching region or return default items
    for region, items in location_items.items():
        if region in location_lower or any(city in location_lower for city in ["new york", "boston"] if region == "northeast") \
                or any(city in location_lower for city in ["miami", "atlanta"] if region == "southeast") \
                or any(city in location_lower for city in ["chicago", "detroit"] if region == "midwest") \
                or any(city in location_lower for city in ["dallas", "phoenix"] if region == "southwest") \
                or any(city in location_lower for city in ["los angeles", "seattle", "san francisco"] if region == "west"):
            return items
    
    # Default to generic items if no region match
    return [
        GroceryItem(
            name="Seasonal Berries",
            category="Produce",
            quantity="1 pint",
            notes="High in antioxidants"
        ),
        GroceryItem(
            name="Local Honey",
            category="Sweeteners",
            quantity="8 oz jar",
            notes="Natural sweetener with potential allergy benefits"
        )
    ]

def get_mock_groceries(run_id: str, location: str) -> GroceryResponse:
    """
    Generate mock grocery recommendations based on run_id and location
    
    Args:
        run_id: The unique identifier for the analysis run
        location: User's location for regional recommendations
        
    Returns:
        GroceryResponse with mock grocery recommendations
    """
    # Load the original analysis to get user_id and medical_report_id
    report_data = get_report_data(run_id)
    user_id = report_data.get("patient_information", {}).get("patient_id", None)
    medical_report_id = report_data.get("patient_information", {}).get("registration_no", None)
    
    # Common healthy groceries (staples for most people)
    core_groceries = [
        GroceryItem(
            name="Extra Virgin Olive Oil",
            category="Oils",
            quantity="500ml bottle",
            notes="Heart-healthy cooking oil",
            alternatives=["Avocado oil", "Coconut oil (in moderation)"]
        ),
        GroceryItem(
            name="Rolled Oats",
            category="Grains",
            quantity="1 lb bag",
            notes="High in fiber, good for heart health",
            alternatives=["Steel-cut oats", "Quinoa"]
        ),
        GroceryItem(
            name="Wild Salmon Fillets",
            category="Protein",
            quantity="1 lb",
            notes="Rich in omega-3 fatty acids",
            alternatives=["Sardines", "Mackerel", "Trout"]
        ),
        GroceryItem(
            name="Leafy Greens Mix",
            category="Produce",
            quantity="5 oz bag",
            notes="Rich in vitamins, minerals and fiber",
            alternatives=["Spinach", "Kale", "Arugula"]
        ),
        GroceryItem(
            name="Garlic",
            category="Produce",
            quantity="1 bulb",
            notes="Anti-inflammatory properties"
        )
    ]
    
    # Get location-specific recommendations
    local_items = get_location_specific_items(location)
    
    # Combine core and location-specific recommendations
    all_groceries = core_groceries + local_items
    
    # Create metadata
    now = datetime.datetime.now()
    metadata = {
        "generated_at": now.isoformat(),
        "location": location,
        "recommendation_type": "health-focused"
    }
    
    # Create response
    response = GroceryResponse(
        run_id=run_id,
        user_id=user_id,
        medical_report_id=medical_report_id,
        metadata=metadata,
        grocery_recommendations=all_groceries
    )
    
    return response 