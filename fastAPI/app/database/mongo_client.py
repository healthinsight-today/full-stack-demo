"""
MongoDB client module for connecting to MongoDB instances
"""

import os
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure

logger = logging.getLogger(__name__)

# MongoDB connection settings
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "health_analytics")

# Global client instance
_mongo_client: Optional[AsyncIOMotorClient] = None

async def initialize_mongodb():
    """Initialize MongoDB connection and verify it's working"""
    global _mongo_client
    
    logger.info(f"Initializing MongoDB connection to {MONGO_URI}")
    
    try:
        # Create the client
        _mongo_client = AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,  # 5 second timeout for server selection
            connectTimeoutMS=10000,         # 10 second timeout for initial connection
            maxPoolSize=10,                 # Maximum connection pool size
            minPoolSize=1,                  # Minimum connection pool size
            maxIdleTimeMS=30000,            # Maximum idle time for a pooled connection
            retryWrites=True,               # Retry write operations on failures
        )
        
        # Verify connection is working by issuing a command
        await _mongo_client.admin.command("ping")
        
        logger.info("MongoDB connection established successfully")
        
        # Create indexes for collections
        db = _mongo_client[MONGO_DB_NAME]
        
        # Analytics collection indexes
        await db.analytics.create_index("user_id")
        await db.analytics.create_index("resource_type")
        await db.analytics.create_index("operation")
        await db.analytics.create_index("recorded_at")
        await db.analytics.create_index([("resource_type", 1), ("resource_id", 1)])
        
        # Parameters collection indexes
        await db.parameters.create_index("name", unique=True)
        await db.parameters.create_index("category")
        await db.parameters.create_index("display_name")
        
        # Parameter history collection indexes
        await db.parameter_history.create_index([("user_id", 1), ("parameter_id", 1)])
        await db.parameter_history.create_index("report_date")
        await db.parameter_history.create_index([
            ("user_id", 1), 
            ("parameter_id", 1), 
            ("report_date", -1)
        ])
        
        logger.info("MongoDB indexes created successfully")
        
    except ConnectionFailure as e:
        logger.error(f"MongoDB connection failed: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error during MongoDB initialization: {str(e)}")
        raise

async def close_mongodb():
    """Close MongoDB connection"""
    global _mongo_client
    
    if _mongo_client:
        logger.info("Closing MongoDB connection")
        _mongo_client.close()
        _mongo_client = None

async def get_database() -> AsyncIOMotorDatabase:
    """
    Get MongoDB database instance
    
    Returns:
        AsyncIOMotorDatabase: MongoDB database instance
    
    Raises:
        ConnectionError: If MongoDB client is not initialized
    """
    if not _mongo_client:
        await initialize_mongodb()
        
    return _mongo_client[MONGO_DB_NAME]

async def get_client() -> AsyncIOMotorClient:
    """
    Get MongoDB client instance
    
    Returns:
        AsyncIOMotorClient: MongoDB client instance
    
    Raises:
        ConnectionError: If MongoDB client is not initialized
    """
    if not _mongo_client:
        await initialize_mongodb()
        
    return _mongo_client 