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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS
)

# Include API router
app.include_router(api_router)  # Remove prefix to use root path

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("="*80)
    logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("="*80)
    
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
    
    logger.info(f"Server starting at http://{settings.HOST}:{settings.PORT}")
    logger.info(f"Documentation available at http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("="*80)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down server...")
    
    # Clean up temporary files
    try:
        temp_files = Path(settings.UPLOAD_DIR).glob("*")
        for file in temp_files:
            try:
                file.unlink()
                logger.debug(f"Cleaned up {file}")
            except Exception as e:
                logger.error(f"Error cleaning up {file}: {e}")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
    
    logger.info("Server shutdown complete.") 