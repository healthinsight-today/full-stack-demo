from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Any, Dict

from app.models.schemas import AuthResponse, Token, User, UserCreate, UserLogin
from app.utils.auth import (
    verify_password, 
    create_access_token, 
    get_user, 
    create_user, 
    user_to_response,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    decode_token,
    USERS
)

router = APIRouter(tags=["Authentication"])

# OAuth2 password bearer scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get the current authenticated user"""
    token_data = decode_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = None
    # In a real app, we would look up the user by ID
    # For this example, we'll loop through our in-memory store
    for u in USERS.values():
        if u.id == token_data.user_id:
            user = u
            break
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user_to_response(user)

@router.post("/login", response_model=AuthResponse)
async def login(form_data: UserLogin) -> AuthResponse:
    """
    Authenticate a user and return an access token.
    """
    user = get_user(form_data.email)
    if not user or not verify_password(form_data.password, user.hashed_password):
        return AuthResponse(
            success=False,
            message="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    # Return response
    return AuthResponse(
        success=True,
        message="Login successful",
        data={
            "user": user_to_response(user),
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
        }
    )

@router.post("/login/form", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    """
    OAuth2 compatible token login endpoint.
    """
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    # Return token response
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    )

@router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserCreate) -> AuthResponse:
    """
    Create a new user account.
    """
    try:
        # Check if user already exists
        existing_user = get_user(user_data.email)
        if existing_user:
            return AuthResponse(
                success=False,
                message="User with this email already exists"
            )
        
        # Create new user
        new_user = create_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.id}, expires_delta=access_token_expires
        )
        
        # Return success response
        return AuthResponse(
            success=True,
            message="User created successfully",
            data={
                "user": user_to_response(new_user),
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
            }
        )
    except ValueError as e:
        return AuthResponse(
            success=False,
            message=str(e)
        )
    except Exception as e:
        return AuthResponse(
            success=False,
            message=f"An error occurred: {str(e)}"
        )

@router.get("/me", response_model=User)
async def get_user_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Get information about the current authenticated user.
    """
    return current_user

@router.get("/test", response_model=Dict[str, str])
async def test_auth_endpoint() -> Dict[str, str]:
    """
    Test endpoint to verify the auth module is working.
    """
    return {"message": "Auth endpoints are set up correctly", "status": "OK"} 