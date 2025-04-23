"""
Parameter models for request and response validation
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, Union, Literal

from pydantic import BaseModel, Field, field_validator, field_serializer

from app.services.database import PyObjectId, MongoBaseModel, object_id_to_str

# Request models
class ParameterHistoryQuery(BaseModel):
    """Parameter history query request model"""
    user_id: Optional[str] = None
    parameter_name: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    abnormal_only: Optional[bool] = False
    direction: Optional[Literal["high", "low"]] = None
    limit: Optional[int] = 100
    sort: Optional[Literal["asc", "desc"]] = "desc"

# Response models
class ParameterNormalRange(BaseModel):
    """Parameter normal range model"""
    min: Optional[float] = None
    max: Optional[float] = None
    text: Optional[str] = None
    unit: str
    age_specific: Optional[Dict[str, Dict[str, Union[float, str]]]] = None
    gender_specific: Optional[Dict[str, Dict[str, Union[float, str]]]] = None

class ParameterDefinition(MongoBaseModel):
    """Parameter definition model"""
    name: str
    code: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    description: Optional[str] = None
    scientific_name: Optional[str] = None
    short_name: Optional[str] = None
    alias: Optional[List[str]] = None
    normal_range: ParameterNormalRange
    unit: str
    common_in_tests: List[str] = []
    is_calculated: bool = False
    calculation_formula: Optional[str] = None
    tags: List[str] = []
    related_parameters: List[str] = []
    created_at: datetime
    updated_at: datetime

class ParameterValue(BaseModel):
    """Single parameter measurement value"""
    value: Union[float, str] = Field(..., description="Parameter value")
    report_date: datetime = Field(..., description="Date of measurement")
    report_id: str = Field(..., description="ID of report containing this value")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    is_abnormal: bool = Field(False, description="Whether value is outside normal range")
    direction: Optional[str] = Field(None, description="Direction of abnormality (high/low)")
    notes: Optional[str] = Field(None, description="Additional notes")
    
    @field_serializer('report_id')
    def serialize_report_id(self, report_id: str) -> str:
        return object_id_to_str(report_id)
    
    model_config = {
        "json_schema_extra": {"example": {"value": 120, "report_date": "2023-01-01T12:00:00"}},
        "validate_by_name": True
    }

class ParameterReference(BaseModel):
    """Reference range for parameter"""
    min: Optional[float] = Field(None, description="Minimum normal value")
    max: Optional[float] = Field(None, description="Maximum normal value")
    text: Optional[str] = Field(None, description="Textual representation of normal range")
    
    @field_validator('text', mode='after')
    @classmethod
    def set_text_from_range(cls, v, values):
        """Set textual representation if not provided"""
        if v is not None:
            return v
        
        min_val = values.data.get('min')
        max_val = values.data.get('max')
        
        if min_val is not None and max_val is not None:
            return f"{min_val} - {max_val}"
        elif min_val is not None:
            return f"≥ {min_val}"
        elif max_val is not None:
            return f"≤ {max_val}"
        return "Normal range not specified"

class Parameter(BaseModel):
    """Health parameter definition"""
    id: str = Field(..., description="Parameter ID")
    name: str = Field(..., description="Parameter name")
    display_name: str = Field(..., description="Display name")
    description: Optional[str] = Field(None, description="Parameter description")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    category: str = Field(..., description="Parameter category")
    reference: ParameterReference = Field(..., description="Normal range")
    value_type: str = Field("numeric", description="Type of value (numeric/text)")
    interpretation: Optional[Dict[str, str]] = Field(None, description="Interpretation guidance")
    actionable: bool = Field(False, description="Whether parameter requires user action")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_serializer('id')
    def serialize_id(self, id: str) -> str:
        return object_id_to_str(id)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "6433e9e97f7b4d5f8a06c2b9",
                "name": "hemoglobin",
                "display_name": "Hemoglobin"
            }
        }
    }

class ParameterHistory(MongoBaseModel):
    """Parameter history model"""
    user_id: str
    parameter_name: str
    values: List[ParameterValue]
    last_updated: datetime
    
    @field_serializer('user_id')
    def serialize_user_id(self, user_id: str) -> str:
        return object_id_to_str(user_id)

class ParameterListResponse(BaseModel):
    """Parameter list response model"""
    success: bool = True
    count: int
    data: List[ParameterDefinition]
    page: int = 1
    total_pages: int = 1
    has_more: bool = False

class ParameterStatistics(BaseModel):
    """Parameter statistics for a user"""
    count: int = Field(..., description="Number of measurements")
    min: Optional[float] = Field(None, description="Minimum value")
    max: Optional[float] = Field(None, description="Maximum value")
    avg: Optional[float] = Field(None, description="Average value")
    median: Optional[float] = Field(None, description="Median value")
    trend: Optional[str] = Field(None, description="Trend direction (improving/worsening/stable)")
    abnormal_count: Optional[int] = Field(None, description="Number of abnormal values")
    last_value: Optional[Dict[str, Any]] = Field(None, description="Last recorded value")

class ParameterHistoryResponse(BaseModel):
    """Parameter history response model"""
    success: bool = True
    parameter_name: str
    values: List[ParameterValue]
    definition: Optional[ParameterDefinition] = None
    data: List[Dict[str, Any]] = []  # For chart data
    statistics: ParameterStatistics = Field(..., description="Parameter statistics")

# Query models
class ParameterHistoryQuery(BaseModel):
    """Query model for parameter history"""
    parameter_name: str = Field(..., description="Parameter name")
    user_id: Optional[str] = Field(None, description="User ID (defaults to current user)")
    date_from: Optional[datetime] = Field(None, description="Start date")
    date_to: Optional[datetime] = Field(None, description="End date")
    abnormal_only: bool = Field(False, description="Only include abnormal values")
    direction: Optional[str] = Field(None, description="Filter by direction (high/low)")
    limit: int = Field(100, description="Max number of results")
    sort: str = Field("desc", description="Sort order (asc/desc)") 