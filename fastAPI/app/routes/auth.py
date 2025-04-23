"""
Authentication routes for user login, signup, token refresh, etc.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt

from app.models.auth_models import (
    UserLogin, 
    UserSignup, 
    RefreshToken, 
    ForgotPassword, 
    ResetPassword,
    PasswordUpdate,
    UserAuthResponse,
    StatusMessageResponse,
    TokenResponse,
    UserProfileResponse
)
from app.services.auth_service import (
    authenticate_user, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    get_user_by_email,
    get_current_active_user,
    create_tokens_for_user,
    get_user,
    verify_password
)
from app.services.database import get_collection, COLLECTIONS
from app.config import settings

# Configure logger
logger = logging.getLogger(__name__)

# Create router with tag
router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=UserAuthResponse)
async def login(user_data: UserLogin):
    """
    Login with email and password to get access token
    """
    # Authenticate user
    user = await authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended",
        )
    
    # Generate access and refresh tokens
    access_token, refresh_token = create_tokens_for_user(user["_id"])
    
    # Update last login timestamp
    users_collection = get_collection(COLLECTIONS["USERS"])
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow(), "last_activity": datetime.utcnow()}}
    )
    
    # Construct response
    user_profile = {
        **user,
        "id": user["_id"]  # For the response model
    }
    user_profile.pop("hashed_password", None)  # Remove password hash
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user_profile,
            "token": {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
                "refresh_token": refresh_token
            }
        }
    }

@router.post("/login/oauth", response_model=UserAuthResponse)
async def login_oauth(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible login for third-party clients
    """
    # Authenticate user
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended",
        )
    
    # Generate access token
    access_token = create_access_token(
        data={"user_id": str(user["_id"])}
    )
    
    # Update last login timestamp
    users_collection = get_collection(COLLECTIONS["USERS"])
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow(), "last_activity": datetime.utcnow()}}
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user,
            "token": {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
            }
        }
    }

@router.post("/signup", response_model=UserAuthResponse)
async def signup(user_data: UserSignup, request: Request):
    """
    Create a new user account
    """
    users_collection = get_collection(COLLECTIONS["USERS"])
    
    # Check if email already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Get source information (e.g., referral)
    referrer = request.headers.get("referer")
    registration_source = "organic"  # Default
    if referrer:
        if "social" in referrer:
            registration_source = "social"
        elif "referral" in referrer:
            registration_source = "referral"
    
    # Create user document
    now = datetime.utcnow()
    new_user = {
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "subscription_tier": "free",  # Default tier
        "registration_date": now,
        "created_at": now,
        "updated_at": now,
        "last_login": now,
        "last_activity": now,
        "status": "active",
        "email_verified": False,  # Email verification required
        "registration_source": registration_source,
        "referrer_id": None,  # Can be updated later if referral code is provided
        "feature_usage": {
            "reports_uploaded": 0,
            "recommendations_viewed": 0,
            "diet_plans_generated": 0
        }
    }
    
    # Insert user to database
    result = await users_collection.insert_one(new_user)
    user_id = result.inserted_id
    
    # Generate tokens
    access_token, refresh_token = create_tokens_for_user(user_id)
    
    # Construct response
    new_user["_id"] = user_id
    new_user["id"] = user_id  # For the response model
    new_user.pop("hashed_password", None)  # Remove password hash
    
    return {
        "success": True,
        "message": "User created successfully",
        "data": {
            "user": new_user,
            "token": {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
                "refresh_token": refresh_token
            }
        }
    }

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(token_data: RefreshToken):
    """
    Refresh access token using refresh token
    """
    try:
        # Decode refresh token
        payload = jwt.decode(token_data.refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user exists and is active
        user = await get_user(user_id)
        if not user or user.get("status") != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user or inactive account",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate new access token
        access_token = create_access_token(data={"user_id": user_id})
        
        # Update last activity
        users_collection = get_collection(COLLECTIONS["USERS"])
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_activity": datetime.utcnow()}}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout", response_model=StatusMessageResponse)
async def logout(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """
    Logout user (client should discard tokens)
    
    Note: JWT tokens can't be invalidated directly since they're stateless.
    For a complete logout solution, implement token revocation through a blacklist
    """
    # Update last activity timestamp
    users_collection = get_collection(COLLECTIONS["USERS"])
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    return {
        "success": True,
        "message": "Successfully logged out"
    }

@router.post("/forgot-password", response_model=StatusMessageResponse)
async def forgot_password(data: ForgotPassword):
    """
    Request password reset link
    """
    user = await get_user_by_email(data.email)
    if not user:
        # Don't reveal email existence, still return success
        return {
            "success": True,
            "message": "If your email is registered, you will receive password reset instructions."
        }
    
    # Generate password reset token (valid for 1 hour)
    reset_token = create_access_token(
        data={"user_id": str(user["_id"]), "purpose": "password_reset"},
        expires_delta=timedelta(hours=1)
    )
    
    # Todo: Send reset email with token
    # For now, just log the token
    logger.info(f"Password reset token for {data.email}: {reset_token}")
    
    # In a real implementation, send email with reset link:
    # reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    return {
        "success": True,
        "message": "If your email is registered, you will receive password reset instructions."
    }

@router.post("/reset-password", response_model=StatusMessageResponse)
async def reset_password(data: ResetPassword):
    """
    Reset password using token
    """
    try:
        # Verify token
        payload = jwt.decode(data.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("user_id")
        purpose = payload.get("purpose")
        
        if not user_id or purpose != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired token"
            )
        
        # Get user
        user = await get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        # Update password
        users_collection = get_collection(COLLECTIONS["USERS"])
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "hashed_password": get_password_hash(data.new_password),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Password has been reset successfully"
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """
    Get current user profile
    """
    # Clean sensitive data
    current_user.pop("hashed_password", None)
    
    # Add id field for Pydantic model
    current_user["id"] = current_user["_id"]
    
    return current_user

@router.patch("/me/password", response_model=StatusMessageResponse)
async def update_password(
    data: PasswordUpdate,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """
    Update user password
    """
    # Verify current password
    if not verify_password(data.current_password, current_user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    users_collection = get_collection(COLLECTIONS["USERS"])
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "hashed_password": get_password_hash(data.new_password),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "message": "Password updated successfully"
    } 