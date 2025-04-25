from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

class HealthInsight(BaseModel):
    """Model for health document insights from LLM."""
    analysis: str
    model_used: str

class ErrorResponse(BaseModel):
    """Model for error responses."""
    error: str
    partial_text: Optional[str] = None

class PDFProcessResponse(BaseModel):
    """Response model for PDF processing endpoint."""
    status: str
    filename: str
    text_file: str
    insights: Dict

# Authentication and User models
class UserBase(BaseModel):
    """Base model for user data"""
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    """Model for user creation"""
    password: str

class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str

class UserInDB(UserBase):
    """Model for user in database"""
    id: str
    hashed_password: str
    created_at: str
    updated_at: str

class User(UserBase):
    """Public user model"""
    id: str
    created_at: str
    updated_at: str
    profile: Dict[str, Any] = {}
    settings: Dict[str, Any] = {}

class Token(BaseModel):
    """Token model"""
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    """Token data model"""
    user_id: str

class AuthResponse(BaseModel):
    """Auth response model"""
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

# New envelope and response models
class Envelope(BaseModel):
    """Base envelope model for all API responses"""
    run_id: str
    user_id: Optional[str] = None
    medical_report_id: Optional[str] = None
    context_id: Optional[str] = None
    metadata: Dict[str, Any]

class MealSlot(BaseModel):
    """Model for a single meal"""
    meal_type: str
    foods: List[str]
    calories: Optional[int] = None
    nutrition_info: Optional[Dict[str, Any]] = None
    preparation_notes: Optional[str] = None

class MealPlanResponse(Envelope):
    """Response model for meal plan endpoints"""
    meal_plan: List[MealSlot]

class GroceryItem(BaseModel):
    """Model for a grocery item"""
    name: str
    category: str
    quantity: Optional[str] = None
    notes: Optional[str] = None
    alternatives: Optional[List[str]] = None

class GroceryResponse(Envelope):
    """Response model for grocery recommendation endpoints"""
    grocery_recommendations: List[GroceryItem]

class Specialist(BaseModel):
    """Model for a healthcare specialist"""
    name: str
    specialty: str
    location: str
    contact: Optional[str] = None
    available_days: Optional[List[str]] = None
    notes: Optional[str] = None

class SpecialistsResponse(Envelope):
    """Response model for specialist recommendation endpoints"""
    specialists: List[Specialist] 