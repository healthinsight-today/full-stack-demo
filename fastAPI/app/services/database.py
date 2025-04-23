"""
MongoDB database connection and utility functions
"""

import os
import logging
from typing import Optional, List, Dict, Any, Annotated, ClassVar, Union
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from bson import ObjectId
from pydantic import BaseModel, Field, field_serializer

from app.config import settings

# Configure logger
logger = logging.getLogger(__name__)

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "healthinsighttoday")

# MongoDB client
client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None

# Collection names
COLLECTIONS = {
    "USERS": "users",
    "REPORTS": "reports",
    "INSIGHTS": "insights",
    "RECOMMENDATIONS": "recommendations",
    "PARAMETER_HISTORY": "parameter_history",
    "EDUCATIONAL_CONTENT": "educational_content",
    "USER_PREFERENCES": "user_preferences",
    "SUBSCRIPTIONS": "subscriptions",
    "PAYMENTS": "payments",
    "ANALYTICS": "analytics"
}

# Even simpler PyObjectId implementation to avoid schema generation issues
class PyObjectId(str):
    """ObjectId field for Pydantic models with string representation"""
    
    @classmethod
    def validate(cls, value):
        """Validate ObjectId"""
        if not isinstance(value, (str, ObjectId)):
            raise TypeError('ObjectId required')
        
        if isinstance(value, str) and not ObjectId.is_valid(value):
            raise ValueError('Invalid ObjectId')
        
        if isinstance(value, ObjectId):
            return str(value)
        return value

# MongoDB Models for Pydantic validation
class MongoBaseModel(BaseModel):
    """Base model with MongoDB ID handling"""
    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId")
    
    @field_serializer('id')
    def serialize_id(self, id: Optional[str]) -> Optional[str]:
        if id is None:
            return None
        return str(id)
    
    model_config = {
        "arbitrary_types_allowed": True,
        "populate_by_name": True,
        "json_encoders": {ObjectId: str},
        "json_schema_extra": {"example": {"_id": "6433e9e97f7b4d5f8a06c2b9"}}
    }

# Helper function to convert ObjectId to string
def object_id_to_str(obj_id):
    """Convert ObjectId to string"""
    if isinstance(obj_id, ObjectId):
        return str(obj_id)
    return obj_id

# Helper function to convert string to ObjectId
def str_to_object_id(id_str):
    """Convert string to ObjectId if valid"""
    if isinstance(id_str, str) and ObjectId.is_valid(id_str):
        return ObjectId(id_str)
    return id_str

async def connect_to_mongodb():
    """Connect to MongoDB"""
    global client, db
    
    # Check if already connected
    if client is not None:
        return
    
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        logger.info(f"Connected to MongoDB at {MONGO_URI}")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongodb_connection():
    """Close MongoDB connection"""
    global client
    
    if client is not None:
        client.close()
        logger.info("MongoDB connection closed")
        client = None

def get_collection(collection_name: str):
    """Get a MongoDB collection by name"""
    if db is None:
        raise Exception("MongoDB not connected")
    
    return db[collection_name]

async def create_indexes():
    """Create indexes for collections"""
    if db is None:
        raise Exception("MongoDB not connected")
    
    # Reports collection
    await db[COLLECTIONS["REPORTS"]].create_index("user_id")
    await db[COLLECTIONS["REPORTS"]].create_index("report_date")
    
    # Users collection
    await db[COLLECTIONS["USERS"]].create_index("email", unique=True)
    await db[COLLECTIONS["USERS"]].create_index("username", unique=True)
    
    # Parameter history
    await db[COLLECTIONS["PARAMETER_HISTORY"]].create_index([("user_id", ASCENDING), ("parameter_name", ASCENDING)])
    
    # Insights collection
    await db[COLLECTIONS["INSIGHTS"]].create_index([("user_id", ASCENDING), ("report_id", ASCENDING)])
    
    # Analytics collection
    await db[COLLECTIONS["ANALYTICS"]].create_index("timestamp")
    await db[COLLECTIONS["ANALYTICS"]].create_index("user_id")
    await db[COLLECTIONS["ANALYTICS"]].create_index("event_type")
    
    logger.info("Database indexes created") 