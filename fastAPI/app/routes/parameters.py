"""
Parameter routes for health parameter definitions and history
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Path, HTTPException, Request

from app.models.parameter_models import (
    ParameterListResponse,
    ParameterHistoryResponse,
    ParameterHistoryQuery
)
from app.services.parameter_service import (
    get_parameters,
    get_parameter_by_id,
    get_parameter_by_name,
    get_parameter_history,
    get_parameter_statistics
)
from app.services.auth_service import get_current_active_user
from app.services.parameter_context import get_parameter_context, ParameterContextManager
from app.middleware.mongodb_context import mongodb_request_context

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(tags=["Parameters"])

@router.get("", response_model=ParameterListResponse)
async def list_parameters(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    sort_by: str = Query("name", description="Field to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    param_context: ParameterContextManager = Depends(get_parameter_context)
):
    """
    List health parameters with filtering and pagination
    """
    # Prepare filters for context tracking
    filters = {
        "page": page,
        "per_page": per_page,
        "category": category,
        "search": search,
        "sort_by": sort_by,
        "sort_order": sort_order
    }
    
    # Record operation through parameter context
    async with mongodb_request_context(request, "parameter", "list") as context:
        # Convert sort order to integer
        sort_order_int = 1 if sort_order.lower() == "asc" else -1
        
        # Get parameters
        parameters, total = await get_parameters(
            page=page,
            limit=per_page,
            category=category,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order_int
        )
        
        # Log context after operation completes
        logger.debug(f"Parameters list context: {context}")
        
        # Calculate total pages
        total_pages = (total + per_page - 1) // per_page
        
        return {
            "success": True,
            "count": len(parameters),
            "data": parameters,
            "page": page,
            "total_pages": total_pages,
            "has_more": page < total_pages
        }

@router.get("/{parameter_id}", response_model=Dict[str, Any])
async def get_parameter(
    request: Request,
    parameter_id: str = Path(..., description="Parameter ID"),
    param_context: ParameterContextManager = Depends(get_parameter_context)
):
    """
    Get parameter definition by ID
    """
    async with mongodb_request_context(request, "parameter", "get", parameter_id) as context:
        try:
            logger.debug(f"Getting parameter by ID: {parameter_id}, context: {context}")
            parameter = await get_parameter_by_id(parameter_id)
            if not parameter:
                raise HTTPException(status_code=404, detail="Parameter not found")
            return parameter
        except Exception as e:
            logger.error(f"Error getting parameter: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-name/{parameter_name}", response_model=Dict[str, Any])
async def get_parameter_by_name_endpoint(
    request: Request,
    parameter_name: str = Path(..., description="Parameter name"),
    param_context: ParameterContextManager = Depends(get_parameter_context)
):
    """
    Get parameter definition by name
    """
    async with mongodb_request_context(request, "parameter", "get_by_name", parameter_name) as context:
        try:
            logger.debug(f"Getting parameter by name: {parameter_name}, context: {context}")
            parameter = await get_parameter_by_name(parameter_name)
            if not parameter:
                raise HTTPException(status_code=404, detail="Parameter not found")
            return parameter
        except Exception as e:
            logger.error(f"Error getting parameter: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{parameter_name}", response_model=ParameterHistoryResponse)
async def get_parameter_history_endpoint(
    request: Request,
    parameter_name: str = Path(..., description="Parameter name"),
    date_from: Optional[datetime] = Query(None, description="Start date"),
    date_to: Optional[datetime] = Query(None, description="End date"),
    abnormal_only: bool = Query(False, description="Only include abnormal values"),
    direction: Optional[str] = Query(None, description="Filter by direction (high/low)"),
    limit: int = Query(100, ge=1, le=1000, description="Max number of results"),
    sort: str = Query("desc", description="Sort order (asc/desc)"),
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    param_context: ParameterContextManager = Depends(get_parameter_context)
):
    """
    Get parameter history for current user
    """
    # Create filters dict for context tracking
    filters = {
        "date_from": date_from,
        "date_to": date_to,
        "abnormal_only": abnormal_only,
        "direction": direction,
        "limit": limit,
        "sort": sort
    }
    
    async with mongodb_request_context(
        request, 
        "parameter_history", 
        "get", 
        f"{current_user['_id']}:{parameter_name}"
    ) as context:
        try:
            logger.debug(f"Getting history for parameter: {parameter_name}, user: {current_user['_id']}, context: {context}")
            
            # Get parameter history
            history = await get_parameter_history(
                user_id=current_user["_id"],
                parameter_name=parameter_name,
                date_from=date_from,
                date_to=date_to,
                abnormal_only=abnormal_only,
                direction=direction,
                limit=limit,
                sort=sort
            )
            
            if not history:
                return {
                    "success": True,
                    "parameter_name": parameter_name,
                    "values": [],
                    "data": [],
                    "statistics": {
                        "count": 0,
                        "min": None,
                        "max": None,
                        "avg": None,
                        "trend": None
                    }
                }
            
            # Get parameter definition
            parameter_def = await get_parameter_by_name(parameter_name)
            
            # Get parameter statistics
            statistics = await get_parameter_statistics(
                user_id=current_user["_id"],
                parameter_name=parameter_name
            )
            
            # Format data for charts
            chart_data = []
            for history_item in history:
                for value in history_item.get("values", []):
                    chart_data.append({
                        "date": value.get("report_date"),
                        "value": value.get("value"),
                        "is_abnormal": value.get("is_abnormal", False),
                        "direction": value.get("direction"),
                        "report_id": str(value.get("report_id"))
                    })
            
            # Sort chart data by date
            chart_data.sort(key=lambda x: x.get("date", datetime.min))
            
            # Record parameter usage through parameter context
            await param_context.record_parameter_usage(parameter_name, str(current_user["_id"]))
            
            return {
                "success": True,
                "parameter_name": parameter_name,
                "values": history[0].get("values", []) if history else [],
                "definition": parameter_def,
                "data": chart_data,
                "statistics": statistics
            }
        except Exception as e:
            logger.error(f"Error getting parameter history: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/history/query", response_model=List[Dict[str, Any]])
async def query_parameter_history(
    request: Request,
    query: ParameterHistoryQuery,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    param_context: ParameterContextManager = Depends(get_parameter_context)
):
    """
    Query parameter history with custom filters
    """
    async with mongodb_request_context(request, "parameter_history", "query") as context:
        try:
            logger.debug(f"Custom query for parameter history: {query}, context: {context}")
            
            # Use current user's ID if not specified
            user_id = query.user_id if query.user_id else str(current_user["_id"])
            
            # Record the query operation through parameter context
            await param_context.query_parameter_history({
                "user_id": user_id,
                "parameter_name": query.parameter_name,
                "date_from": query.date_from,
                "date_to": query.date_to,
                "abnormal_only": query.abnormal_only,
                "direction": query.direction,
                "limit": query.limit,
                "sort": query.sort
            })
            
            # Get parameter history
            history = await get_parameter_history(
                user_id=user_id,
                parameter_name=query.parameter_name,
                date_from=query.date_from,
                date_to=query.date_to,
                abnormal_only=query.abnormal_only,
                direction=query.direction,
                limit=query.limit,
                sort=query.sort
            )
            
            return history
        except Exception as e:
            logger.error(f"Error querying parameter history: {e}")
            raise HTTPException(status_code=500, detail=str(e)) 