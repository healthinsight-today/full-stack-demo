"""
Parameter service for accessing and managing health parameters
"""

import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple, Union
from bson import ObjectId

from app.services.database import get_collection, COLLECTIONS

# Configure logger
logger = logging.getLogger(__name__)

async def get_parameters(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_order: int = 1  # 1 for ascending, -1 for descending
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Get parameters with pagination, filtering, and sorting
    
    Args:
        page: Page number (1-based)
        limit: Number of items per page
        category: Filter by category
        search: Search by name or description
        sort_by: Field to sort by
        sort_order: Sort order (1 for ascending, -1 for descending)
        
    Returns:
        Tuple of (parameters list, total count)
    """
    try:
        # Get collection
        collection = get_collection(COLLECTIONS["EDUCATIONAL_CONTENT"])
        
        # Build filter
        filter_query = {}
        if category:
            filter_query["category"] = category
        if search:
            filter_query["$or"] = [
                {"parameter_name": {"$regex": search, "$options": "i"}},
                {"content.explanation": {"$regex": search, "$options": "i"}},
                {"content.tags": search}
            ]
        
        # Count total documents
        total = await collection.count_documents(filter_query)
        
        # Build sort query
        sort_query = [(sort_by, sort_order)]
        
        # Get paginated results
        skip = (page - 1) * limit
        cursor = collection.find(filter_query).sort(sort_query).skip(skip).limit(limit)
        parameters = await cursor.to_list(length=limit)
        
        return parameters, total
    except Exception as e:
        logger.error(f"Error getting parameters: {e}")
        return [], 0

async def get_parameter_by_name(parameter_name: str) -> Optional[Dict[str, Any]]:
    """
    Get parameter definition by name
    
    Args:
        parameter_name: Parameter name
        
    Returns:
        Parameter definition or None if not found
    """
    try:
        collection = get_collection(COLLECTIONS["EDUCATIONAL_CONTENT"])
        parameter = await collection.find_one({"parameter_name": parameter_name})
        return parameter
    except Exception as e:
        logger.error(f"Error getting parameter by name: {e}")
        return None

async def get_parameter_by_id(parameter_id: str) -> Optional[Dict[str, Any]]:
    """
    Get parameter definition by ID
    
    Args:
        parameter_id: Parameter ID
        
    Returns:
        Parameter definition or None if not found
    """
    try:
        collection = get_collection(COLLECTIONS["EDUCATIONAL_CONTENT"])
        parameter = await collection.find_one({"_id": ObjectId(parameter_id)})
        return parameter
    except Exception as e:
        logger.error(f"Error getting parameter by ID: {e}")
        return None

async def get_parameter_history(
    user_id: Union[str, ObjectId],
    parameter_name: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    abnormal_only: bool = False,
    direction: Optional[str] = None,
    limit: int = 100,
    sort: str = "desc"
) -> List[Dict[str, Any]]:
    """
    Get parameter history for a user
    
    Args:
        user_id: User ID
        parameter_name: Parameter name (optional)
        date_from: Start date (optional)
        date_to: End date (optional)
        abnormal_only: Only include abnormal values
        direction: Filter by direction ("high" or "low")
        limit: Max number of results to return
        sort: Sort order ("asc" or "desc")
        
    Returns:
        List of parameter history records
    """
    try:
        # Convert user_id to ObjectId if it's a string
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Get collection
        collection = get_collection(COLLECTIONS["PARAMETER_HISTORY"])
        
        # Build filter
        filter_query = {"user_id": user_id}
        if parameter_name:
            filter_query["parameter_name"] = parameter_name
        
        # Additional filters for the values array
        value_filters = []
        if date_from or date_to:
            date_filter = {}
            if date_from:
                date_filter["$gte"] = date_from
            if date_to:
                date_filter["$lte"] = date_to
            if date_filter:
                value_filters.append({"values.report_date": date_filter})
        
        if abnormal_only:
            value_filters.append({"values.is_abnormal": True})
        
        if direction:
            value_filters.append({"values.direction": direction})
        
        # Combine with main filter if needed
        if value_filters:
            filter_query["$and"] = value_filters
        
        # Handle sorting
        sort_direction = -1 if sort == "desc" else 1
        sort_query = [("values.report_date", sort_direction)]
        
        cursor = collection.find(filter_query).sort(sort_query).limit(limit)
        history = await cursor.to_list(length=limit)
        
        return history
    except Exception as e:
        logger.error(f"Error getting parameter history: {e}")
        return []

async def get_parameter_statistics(
    user_id: Union[str, ObjectId],
    parameter_name: str
) -> Dict[str, Any]:
    """
    Get statistics for a parameter's history (min, max, avg, trend)
    
    Args:
        user_id: User ID
        parameter_name: Parameter name
        
    Returns:
        Statistics object
    """
    try:
        # Convert user_id to ObjectId if it's a string
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Get collection
        collection = get_collection(COLLECTIONS["PARAMETER_HISTORY"])
        
        # Get history
        history = await collection.find_one({
            "user_id": user_id,
            "parameter_name": parameter_name
        })
        
        if not history or not history.get("values"):
            return {
                "count": 0,
                "min": None,
                "max": None,
                "avg": None,
                "trend": None,
                "latest": None,
                "normal_count": 0,
                "abnormal_count": 0
            }
        
        values = history["values"]
        
        # Extract numeric values
        numeric_values = [v["value"] for v in values if "value" in v]
        if not numeric_values:
            return {
                "count": 0,
                "min": None,
                "max": None,
                "avg": None,
                "trend": None,
                "latest": None,
                "normal_count": 0,
                "abnormal_count": 0
            }
        
        # Calculate statistics
        min_value = min(numeric_values)
        max_value = max(numeric_values)
        avg_value = sum(numeric_values) / len(numeric_values)
        
        # Sort values by date
        sorted_values = sorted(values, key=lambda x: x.get("report_date", datetime.min))
        latest = sorted_values[-1] if sorted_values else None
        
        # Calculate trend (simple: comparing first and last values)
        if len(sorted_values) >= 2:
            first_value = sorted_values[0]["value"]
            last_value = sorted_values[-1]["value"]
            
            if last_value > first_value:
                trend = "increasing"
            elif last_value < first_value:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        # Count normal/abnormal
        normal_count = sum(1 for v in values if not v.get("is_abnormal", False))
        abnormal_count = sum(1 for v in values if v.get("is_abnormal", False))
        
        return {
            "count": len(values),
            "min": min_value,
            "max": max_value,
            "avg": avg_value,
            "trend": trend,
            "latest": latest,
            "normal_count": normal_count,
            "abnormal_count": abnormal_count
        }
    except Exception as e:
        logger.error(f"Error getting parameter statistics: {e}")
        return {
            "count": 0,
            "min": None,
            "max": None,
            "avg": None,
            "trend": None,
            "latest": None,
            "normal_count": 0,
            "abnormal_count": 0,
            "error": str(e)
        } 