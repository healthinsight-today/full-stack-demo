from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import string
import uuid
from app.models.schemas import TokenData, User, UserInDB

# Secret key for JWT token generation
# In production, this should be stored securely
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify if the provided password matches the hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password for storage"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[TokenData]:
    """Decode a JWT token and return the TokenData"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(user_id=user_id)
    except JWTError:
        return None

def generate_password():
    """Generate a random secure password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(12))

def create_demo_user() -> UserInDB:
    """Create a demo user for testing"""
    now = datetime.utcnow().isoformat()
    return UserInDB(
        id=str(uuid.uuid4()),
        email="demo@example.com",
        name="Demo User",
        hashed_password=get_password_hash("password"),
        created_at=now,
        updated_at=now
    )

# In-memory user store for demo purposes
# In a real application, this would be replaced with a database
USERS = {
    "demo@example.com": create_demo_user()
}

def get_user(email: str) -> Optional[UserInDB]:
    """Get a user by email from the store"""
    return USERS.get(email)

def create_user(email: str, password: str, name: Optional[str] = None) -> UserInDB:
    """Create a new user and store it"""
    if email in USERS:
        raise ValueError("User already exists")
    
    now = datetime.utcnow().isoformat()
    user = UserInDB(
        id=str(uuid.uuid4()),
        email=email,
        name=name or email.split('@')[0],
        hashed_password=get_password_hash(password),
        created_at=now,
        updated_at=now
    )
    
    USERS[email] = user
    return user

def user_to_response(user: UserInDB) -> User:
    """Convert UserInDB to public User model"""
    return User(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at,
        updated_at=user.updated_at,
        profile={},
        settings={}
    ) 