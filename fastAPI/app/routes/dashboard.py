"""
Dashboard routes for health summaries and insights
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException, Query

from app.services.mcp_service import MCPService, MCPRequest, MCPContext
from app.services.templates import template_registry

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Initialize services
mcp_service = MCPService()

class HealthMetric(BaseModel):
    """Model for health metric"""
    name: str = Field(..., description="Name of the metric")
    value: float = Field(..., description="Current value")
    unit: str = Field(..., description="Unit of measurement")
    reference_range: Dict[str, float] = Field(..., description="Normal range")
    status: str = Field(..., description="Status (normal, high, low, critical)")
    trend: Optional[str] = Field(None, description="Trend direction if historical data exists")
    change_percent: Optional[float] = Field(None, description="Percentage change from last measurement")

class HealthInsight(BaseModel):
    """Model for health insight"""
    category: str = Field(..., description="Category of insight")
    title: str = Field(..., description="Short title")
    description: str = Field(..., description="Detailed description")
    severity: str = Field(..., description="Severity level")
    recommendations: List[str] = Field(..., description="Action recommendations")
    related_metrics: List[str] = Field(..., description="Related health metrics")

class HealthSummary(BaseModel):
    """Model for health summary"""
    user_id: str = Field(..., description="User ID")
    timestamp: datetime = Field(default_factory=datetime.now)
    overall_status: str = Field(..., description="Overall health status")
    key_metrics: List[HealthMetric] = Field(..., description="Key health metrics")
    insights: List[HealthInsight] = Field(..., description="Health insights")
    recommendations: List[Dict[str, Any]] = Field(..., description="Personalized recommendations")
    metadata: Dict[str, Any] = Field(default_factory=dict)

@router.get("/summary", response_model=HealthSummary)
async def get_health_summary(
    user_id: str,
    timeframe: str = Query("recent", enum=["recent", "weekly", "monthly", "yearly"]),
    provider: str = "claude",
    model: Optional[str] = None
):
    """
    Get comprehensive health summary
    
    Args:
        user_id: User ID
        timeframe: Time period to analyze
        provider: LLM provider to use
        model: Specific model to use
    """
    try:
        # Get user's health data
        # TODO: Implement data retrieval
        health_data = {}  # Placeholder
        
        if not health_data:
            raise HTTPException(
                status_code=404,
                detail=f"Health data not found for user {user_id}"
            )
        
        # Get summary template
        template = template_registry.get_template("health_summary")
        if not template:
            raise HTTPException(
                status_code=500,
                detail="Health summary template not found"
            )
        
        # Create context with customizations
        context = template.create_base_context()
        context = template.customize_context(context, {
            "timeframe": timeframe,
            "health_data": health_data
        })
        
        # Generate summary
        mcp_request = MCPRequest(
            context=context,
            provider=provider,
            model=model,
            temperature=0.1  # Low temperature for consistent analysis
        )
        
        response = await mcp_service.generate_response(mcp_request)
        
        # Parse and validate summary
        try:
            import json
            summary_data = json.loads(response.message.content)
            
            # Validate response
            is_valid, error_message = template.validate_response(summary_data)
            if not is_valid:
                raise ValueError(f"Invalid response format: {error_message}")
            
            return HealthSummary(
                user_id=user_id,
                overall_status=summary_data["overall_status"],
                key_metrics=summary_data["key_metrics"],
                insights=summary_data["insights"],
                recommendations=summary_data["recommendations"],
                metadata={
                    "timeframe": timeframe,
                    "provider": response.provider,
                    "model": response.model,
                    "template_version": template.version,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing health summary: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing health summary: {str(e)}"
            )
            
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error generating health summary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generating health summary: {str(e)}"
        )

@router.get("/trends")
async def get_health_trends(
    user_id: str,
    metrics: Optional[List[str]] = Query(None),
    start_date: datetime = Query(default_factory=lambda: datetime.now() - timedelta(days=90)),
    end_date: datetime = Query(default_factory=datetime.now)
):
    """
    Get trends for specified health metrics
    
    Args:
        user_id: User ID
        metrics: List of metrics to analyze
        start_date: Start date for trend analysis
        end_date: End date for trend analysis
    """
    try:
        # TODO: Implement trend analysis
        # For now, return sample data
        return {
            "trends": [
                {
                    "metric": "Blood Glucose",
                    "unit": "mg/dL",
                    "data_points": [
                        {"timestamp": "2024-01-01T08:00:00", "value": 95},
                        {"timestamp": "2024-02-01T08:00:00", "value": 92},
                        {"timestamp": "2024-03-01T08:00:00", "value": 88}
                    ],
                    "trend": "decreasing",
                    "change_rate": -7.37,
                    "statistical_significance": True
                },
                {
                    "metric": "Total Cholesterol",
                    "unit": "mg/dL",
                    "data_points": [
                        {"timestamp": "2024-01-01T08:00:00", "value": 210},
                        {"timestamp": "2024-02-01T08:00:00", "value": 195},
                        {"timestamp": "2024-03-01T08:00:00", "value": 185}
                    ],
                    "trend": "decreasing",
                    "change_rate": -11.90,
                    "statistical_significance": True
                }
            ],
            "metadata": {
                "user_id": user_id,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "metrics_analyzed": metrics or "all",
                "analysis_timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error analyzing health trends: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing health trends: {str(e)}"
        )

@router.get("/insights/latest")
async def get_latest_insights(
    user_id: str,
    categories: Optional[List[str]] = Query(None),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get latest health insights
    
    Args:
        user_id: User ID
        categories: Categories to filter by
        limit: Maximum number of insights to return
    """
    try:
        # TODO: Implement insights retrieval
        # For now, return sample data
        return {
            "insights": [
                {
                    "category": "Blood Sugar",
                    "title": "Improved Glucose Control",
                    "description": "Your blood glucose levels have shown consistent improvement over the past 3 months",
                    "severity": "positive",
                    "recommendations": [
                        "Continue current diet and exercise routine",
                        "Maintain regular testing schedule"
                    ],
                    "related_metrics": ["Blood Glucose", "HbA1c"],
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "category": "Cardiovascular",
                    "title": "Cholesterol Improvement",
                    "description": "Your total cholesterol has decreased by 12% since your last test",
                    "severity": "positive",
                    "recommendations": [
                        "Continue heart-healthy diet",
                        "Maintain regular exercise routine"
                    ],
                    "related_metrics": ["Total Cholesterol", "LDL", "HDL"],
                    "timestamp": datetime.now().isoformat()
                }
            ],
            "metadata": {
                "user_id": user_id,
                "categories": categories or "all",
                "limit": limit,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error retrieving health insights: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving health insights: {str(e)}"
        ) 