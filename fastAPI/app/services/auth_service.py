"""
Authentication services for JWT token generation and validation
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId

from app.config import settings
from app.services.database import get_collection, COLLECTIONS

# Configure logger
logger = logging.getLogger(__name__)

# Security utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

# User collection reference
def get_users_collection():
    return get_collection(COLLECTIONS["USERS"])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    users_collection = get_users_collection()
    user = await users_collection.find_one({"email": email})
    return user

async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with email and password"""
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password", "")):
        return None
    return user

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Convert ObjectId to string if present
    if "user_id" in to_encode and isinstance(to_encode["user_id"], ObjectId):
        to_encode["user_id"] = str(to_encode["user_id"])
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create refresh token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    
    # Convert ObjectId to string if present
    if "user_id" in to_encode and isinstance(to_encode["user_id"], ObjectId):
        to_encode["user_id"] = str(to_encode["user_id"])
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

async def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    users_collection = get_users_collection()
    try:
        user_id_obj = ObjectId(user_id)
        user = await users_collection.find_one({"_id": user_id_obj})
        return user
    except Exception as e:
        logger.error(f"Error getting user by ID: {e}")
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user(user_id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get current active user"""
    if current_user.get("status") != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def create_tokens_for_user(user_id: Union[str, ObjectId]) -> Tuple[str, str]:
    """Create access and refresh tokens for a user"""
    # Ensure user_id is a string
    user_id_str = str(user_id) if isinstance(user_id, ObjectId) else user_id
    
    # Create access token
    access_token = create_access_token(
        data={"user_id": user_id_str},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(
        data={"user_id": user_id_str},
        expires_delta=timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return access_token, refresh_token 