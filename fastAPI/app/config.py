import os
import json
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional, List, Union
from pydantic import Field

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""
    
    # General settings
    APP_NAME: str = "HealthInsightToday API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "API for health report analysis and insights"
    ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"  # Include version in prefix
   
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    RELOAD: bool = True
    
    # CORS settings
    CORS_ORIGINS: Union[List[str], str] = ["*"]  # Allow all origins in development
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]  # Allow all methods
    CORS_ALLOW_HEADERS: List[str] = ["*"]  # Allow all headers
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")  # If set, will log to this file
    
    # File storage settings
    UPLOAD_DIR: str = "uploads"  # Where original uploaded files are stored
    TEXT_DIR: str = "text"       # Where extracted text files are stored
    PROCESSED_DIR: str = "processed"  # Where processed JSON files are stored
    REPORTS_DIR: str = "reports"  # Where generated reports are stored
    REPORTS_JSON_DIR: str = "processed"  # For compatibility, same as PROCESSED_DIR
    REPORTS_PDF_DIR: str = "uploads"     # For compatibility, same as UPLOAD_DIR
    REPORTS_TEXT_DIR: str = "reports"    # For compatibility, same as REPORTS_DIR 
    
    # Upload settings
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB
    
    # MongoDB settings
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB: str = os.getenv("MONGO_DB", "healthinsighttoday")
    
    # JWT Authentication settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-super-secret-key-change-this-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", 7))
    
    # OpenAI API settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    OPENAI_API_URL: str = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
    
    # Anthropic API settings
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-7-sonnet-20250219")
    ANTHROPIC_API_URL: str = os.getenv("ANTHROPIC_API_URL", "https://api.anthropic.com/v1/messages")
    
    # Grok API settings
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", os.getenv("XAI_API_KEY", ""))
    GROK_MODEL: str = os.getenv("GROK_MODEL", os.getenv("XAI_MODEL", "grok-3-latest"))
    GROK_API_BASE_URL: str = os.getenv("GROK_API_BASE_URL", os.getenv("XAI_API_BASE_URL", "https://api.x.ai/v1"))
    GROK_API_URL: str = os.getenv("GROK_API_URL", os.getenv("XAI_API_URL", f"{GROK_API_BASE_URL}/chat/completions"))
    
    # Aliases for backward compatibility
    XAI_API_KEY: str = GROK_API_KEY
    XAI_MODEL: str = GROK_MODEL
    XAI_API_BASE_URL: str = GROK_API_BASE_URL
    XAI_API_URL: str = GROK_API_URL
    
    # LLM settings
    DEFAULT_LLM_PROVIDER: str = "claude"  # openai, claude, grok
    DEFAULT_LLM_MODEL: str = "claude-3-7-sonnet-20250219"  # if empty, will use provider's default model
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.1"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "16000"))  # Max input tokens for processing
    LLM_OUTPUT_TOKENS: int = int(os.getenv("LLM_OUTPUT_TOKENS", "8192"))  # Max output tokens for response
    
    # Backward compatibility
    OPENAI_API_KEY_BACKCOMPAT: str = Field("", env="OPENAI_KEY")
    ANTHROPIC_API_KEY_BACKCOMPAT: str = Field("", env="ANTHROPIC_KEY")
    GROQ_API_KEY_BACKCOMPAT: str = Field("", env="GROQ_KEY")  # For backward compatibility
    
    class Config:
        env_file = ".env"
        
        # Allow extra fields to prevent validation errors from future environment variables
        extra = "ignore"
        
        # Make attribute access case-insensitive
        case_sensitive = False

    def __init__(self, **data):
        super().__init__(**data)
        # Apply backward compatibility
        if not self.OPENAI_API_KEY and self.OPENAI_API_KEY_BACKCOMPAT:
            self.OPENAI_API_KEY = self.OPENAI_API_KEY_BACKCOMPAT
        
        if not self.ANTHROPIC_API_KEY and self.ANTHROPIC_API_KEY_BACKCOMPAT:
            self.ANTHROPIC_API_KEY = self.ANTHROPIC_API_KEY_BACKCOMPAT
            
        if not self.GROK_API_KEY and self.GROQ_API_KEY_BACKCOMPAT:
            self.GROK_API_KEY = self.GROQ_API_KEY_BACKCOMPAT
        
        # Set default LLM model based on provider if not set
        if not self.DEFAULT_LLM_MODEL:
            if self.DEFAULT_LLM_PROVIDER == "openai":
                self.DEFAULT_LLM_MODEL = self.OPENAI_MODEL
            elif self.DEFAULT_LLM_PROVIDER == "claude" or self.DEFAULT_LLM_PROVIDER == "anthropic":
                self.DEFAULT_LLM_MODEL = self.ANTHROPIC_MODEL
            elif self.DEFAULT_LLM_PROVIDER == "grok" or self.DEFAULT_LLM_PROVIDER == "xai":
                self.DEFAULT_LLM_MODEL = self.GROK_MODEL
        
        # Handle CORS_ORIGINS if it's a JSON string
        if isinstance(self.CORS_ORIGINS, str):
            try:
                # Try to parse as JSON first
                self.CORS_ORIGINS = json.loads(self.CORS_ORIGINS)
            except json.JSONDecodeError:
                # If not valid JSON, treat as comma-separated string
                self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

# Initialize settings
settings = Settings()

def get_settings():
    """Return the Settings instance."""
    return settings 
