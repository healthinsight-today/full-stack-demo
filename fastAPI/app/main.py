"""
Health Insight Today API
"""

import logging
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import api_router
from app.services.database import connect_to_mongodb, close_mongodb_connection, create_indexes
from app.middleware.context_middleware import setup_context_middleware
from app.database.mongo_client import initialize_mongodb, close_mongodb

# Configure logging
log_config = {
    'level': getattr(logging, settings.LOG_LEVEL),
    'format': settings.LOG_FORMAT
}

if settings.LOG_FILE:
    log_config['filename'] = settings.LOG_FILE
    log_config['filemode'] = 'a'  # Append mode
    
logging.basicConfig(**log_config)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Parse CORS origins from string to list if needed
cors_origins = settings.CORS_ORIGINS
if isinstance(cors_origins, str):
    cors_origins = [origin.strip() for origin in cors_origins.split(",")]
    
# Add CORS middleware with properly configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS
)

# Setup context middleware
setup_context_middleware(app)

# Include API router
app.include_router(api_router)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("="*80)
    logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("="*80)
    
    # Log CORS configuration
    logger.info(f"CORS Origins: {cors_origins}")
    
    # Check API keys
    if not settings.OPENAI_API_KEY:
        logger.warning("⚠️ OPENAI_API_KEY is not configured. OpenAI services will not be available.")
    else:
        logger.info("✅ OpenAI API key configured.")
        
    if settings.ANTHROPIC_API_KEY:
        logger.info("✅ Anthropic Claude API key configured.")
    else:
        logger.warning("⚠️ ANTHROPIC_API_KEY is not configured. Claude services will not be available.")
        
    if settings.GROK_API_KEY:
        logger.info("✅ Grok/xAI API key configured.")
    else:
        logger.warning("⚠️ GROK_API_KEY is not configured. Grok services will not be available.")
    
    # Create required directories
    try:
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.TEXT_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.REPORTS_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.PROCESSED_DIR).mkdir(parents=True, exist_ok=True)
        logger.info("✅ Required directories created.")
    except Exception as e:
        logger.error(f"❌ Error creating directories: {e}")
        raise
    
    # Connect to MongoDB
    try:
        # Connect to MongoDB using both the database service and mongo_client module
        await connect_to_mongodb()
        await initialize_mongodb()
        await create_indexes()
        logger.info("✅ MongoDB connected and indexes created.")
        logger.info("✅ Context tracking middleware initialized.")
    except Exception as e:
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        logger.warning("Application will continue, but MongoDB features will be unavailable.")
    
    logger.info(f"Server starting at http://{settings.HOST}:{settings.PORT}")
    logger.info(f"Documentation available at http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("="*80)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    logger.info("Shutting down API server...")
    
    # Close MongoDB connections
    try:
        await close_mongodb_connection()
        await close_mongodb()
        logger.info("MongoDB connections closed.")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")
    
    logger.info("Server shutdown complete.") 