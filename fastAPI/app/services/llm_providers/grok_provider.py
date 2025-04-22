"""
Grok (xAI) LLM provider implementation
"""

from typing import List, Optional, Dict, Any
import logging
import requests
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage

from app.config import settings
from app.services.llm_providers import BaseLLMProvider

logger = logging.getLogger(__name__)

class GrokProvider(BaseLLMProvider):
    """Provider implementation for Grok (xAI) models"""
    
    def __init__(self):
        """Initialize the Grok provider"""
        self.api_key = settings.GROK_API_KEY
        self.api_base_url = settings.GROK_API_BASE_URL
        self._supported_models = {
            "grok-3",
            "grok-3-latest",
            "grok-2",
            "grok-1"
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
        """Generate a response using Grok"""
        try:
            # Use specified model or default
            model_name = model or self.get_default_model()
            if not self.validate_model(model_name):
                logger.warning(f"Invalid Grok model: {model_name}. Using default.")
                model_name = self.get_default_model()
            
            # Convert messages to Grok format
            grok_messages = []
            for msg in messages:
                if isinstance(msg, SystemMessage):
                    grok_messages.append({"role": "system", "content": msg.content})
                elif isinstance(msg, HumanMessage):
                    grok_messages.append({"role": "user", "content": msg.content})
                elif isinstance(msg, AIMessage):
                    grok_messages.append({"role": "assistant", "content": msg.content})
            
            # Prepare request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": model_name,
                "messages": grok_messages,
                "temperature": temperature,
                "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
                "stop": stop,
                **kwargs
            }
            
            # Make API request
            response = requests.post(
                f"{self.api_base_url}/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            
            # Extract content and metadata
            content = result["choices"][0]["message"]["content"]
            usage = result.get("usage", {})
            
            return {
                "content": content,
                "model": model_name,
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens"),
                    "completion_tokens": usage.get("completion_tokens"),
                    "total_tokens": usage.get("total_tokens")
                },
                "metadata": {
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stop_sequences": stop,
                    "finish_reason": result["choices"][0].get("finish_reason"),
                    **kwargs
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating response with Grok: {str(e)}")
            raise
    
    def get_default_model(self) -> str:
        """Get the default Grok model"""
        return settings.GROK_MODEL or "grok-3-latest"
    
    def validate_model(self, model: str) -> bool:
        """Check if the model is supported by Grok"""
        return model in self._supported_models 