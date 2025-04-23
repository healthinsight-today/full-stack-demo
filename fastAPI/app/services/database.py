"""
MongoDB database connection and utility functions
"""

import os
import logging
from typing import Optional, List, Dict, Any, Annotated, ClassVar, Union
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
from bson import ObjectId
from pydantic import BaseModel, Field, GetJsonSchemaHandler, field_serializer
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema

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

# PyObjectId class simplified for Pydantic v2
class PyObjectId(str):
    """ObjectId field for Pydantic models with string representation"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, (str, ObjectId)):
            raise TypeError('ObjectId required')
        if isinstance(v, str):
            if not ObjectId.is_valid(v):
                raise ValueError('Invalid ObjectId')
            return str(v)
        return str(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, schema_generator: GetJsonSchemaHandler) -> JsonSchemaValue:
        return schema_generator.get_schema_for_type(str)

# MongoDB Models for Pydantic validation
class MongoBaseModel(BaseModel):
    """Base model with MongoDB ID handling"""
    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId")
    
    @field_serializer('id')
    def serialize_id(self, id: Optional[str]) -> Optional[str]:
        if id is None:
            return None
        return str(id)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

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