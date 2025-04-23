"""
Authentication models for request and response validation
"""

from datetime import datetime
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, EmailStr, Field, field_serializer

from app.services.database import PyObjectId, MongoBaseModel, object_id_to_str

# Request models
class UserLogin(BaseModel):
    """User login request model"""
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    """User registration request model"""
    email: EmailStr
    password: str
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    
class TokenPayload(BaseModel):
    """Token payload model"""
    sub: str  # subject (user ID)
    exp: datetime  # expiration time
    
class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None
    
# Response models
class UserProfile(BaseModel):
    """User profile response model"""
    id: str = Field(..., description="User ID")
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, id: str) -> str:
        return object_id_to_str(id)
    
class UserProfileResponse(UserProfile):
    """Extended user profile response with additional fields"""
    email_verified: bool = False
    phone: Optional[str] = None
    phone_verified: bool = False
    is_active: bool = True
    roles: List[str] = ["user"]
    last_login: Optional[datetime] = None
    settings: Dict[str, Any] = {}
    subscription_status: Optional[str] = None
    subscription_expires: Optional[datetime] = None
    reports_count: int = 0
    
class UserInDB(UserProfileResponse):
    """User stored in database"""
    hashed_password: str
    referrer_id: Optional[str] = None
    registration_source: str
    last_activity: datetime
    
    @field_serializer('referrer_id')
    def serialize_referrer_id(self, referrer_id: Optional[str]) -> Optional[str]:
        if referrer_id is None:
            return None
        return object_id_to_str(referrer_id)
    
class UserUpdateRequest(BaseModel):
    """User update request model"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    
class PasswordChange(BaseModel):
    """Password change request model"""
    current_password: str
    new_password: str

class UserSignup(BaseModel):
    """User signup request model"""
    name: str
    email: EmailStr
    password: str

class PasswordUpdate(BaseModel):
    """Password update request model"""
    current_password: str
    new_password: str

class ForgotPassword(BaseModel):
    """Forgot password request model"""
    email: EmailStr

class ResetPassword(BaseModel):
    """Reset password request model"""
    token: str
    new_password: str

class RefreshToken(BaseModel):
    """Refresh token request model"""
    refresh_token: str

class UserAuthResponse(BaseModel):
    """User authentication response model"""
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = {
        "user": Optional[UserProfileResponse],
        "token": Optional[TokenResponse]
    }

class StatusMessageResponse(BaseModel):
    """Status message response model"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None 