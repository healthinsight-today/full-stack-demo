"""
Provider interfaces for different LLM services
"""

from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from langchain_core.messages import BaseMessage

class BaseLLMProvider(ABC):
    """Base class for all LLM providers"""
    
    @abstractmethod
    async def generate(
        self,
        messages: List[BaseMessage],
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: Optional[int] = None,
        stop: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response from the LLM
        
        Args:
            messages: List of messages in the conversation
            model: Model to use (provider-specific)
            temperature: Temperature for generation
            max_tokens: Maximum tokens to generate
            stop: List of stop sequences
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Dictionary containing:
            - content: Generated text
            - usage: Token usage information
            - model: Model used
            - metadata: Additional provider-specific information
        """
        pass
    
    @abstractmethod
    def get_default_model(self) -> str:
        """Get the default model for this provider"""
        pass
    
    @abstractmethod
    def validate_model(self, model: str) -> bool:
        """Validate if a model name is supported by this provider"""
        pass 