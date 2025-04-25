"""
Claude (Anthropic) LLM provider implementation
"""

from typing import List, Optional, Dict, Any
import logging
from langchain_core.messages import BaseMessage
from langchain_anthropic import ChatAnthropic

from app.config import settings
from app.services.llm_providers import BaseLLMProvider

logger = logging.getLogger(__name__)

class ClaudeProvider(BaseLLMProvider):
    """Provider implementation for Claude (Anthropic) models"""
    
    def __init__(self):
        """Initialize the Claude provider"""
        self.api_key = settings.ANTHROPIC_API_KEY
        self._supported_models = {
            "claude-3-7-sonnet-20250219",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
            "claude-2.1",
            "claude-2.0",
            "claude-instant-1.2"
        }
    
    async def generate(
        self,
        messages: List[BaseMessage],
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: Optional[int] = None,
        stop: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate a response using Claude"""
        try:
            # Use specified model or default
            model_name = model or self.get_default_model()
            if not self.validate_model(model_name):
                logger.warning(f"Invalid Claude model: {model_name}. Using default.")
                model_name = self.get_default_model()
            
            # Initialize Claude client
            client = ChatAnthropic(
                anthropic_api_key=self.api_key,
                model=model_name,
                temperature=temperature,
                max_tokens_to_sample=max_tokens or settings.LLM_MAX_TOKENS,
                stop_sequences=stop
            )
            
            # Generate response
            response = await client.ainvoke(messages)
            
            # Extract content and metadata
            return {
                "content": response.content,
                "model": model_name,
                "usage": {
                    "prompt_tokens": None,  # Not provided by Claude
                    "completion_tokens": None,
                    "total_tokens": None
                },
                "metadata": {
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stop_sequences": stop,
                    **kwargs
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating response with Claude: {str(e)}")
            raise
    
    def get_default_model(self) -> str:
        """Get the default Claude model"""
        return settings.ANTHROPIC_MODEL or "claude-3-sonnet-20240229"
    
    def validate_model(self, model: str) -> bool:
        """Check if the model is supported by Claude"""
        return model in self._supported_models 