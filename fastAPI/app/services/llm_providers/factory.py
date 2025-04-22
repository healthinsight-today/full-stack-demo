"""
Factory for managing LLM providers
"""

from typing import Dict, Type
import logging

from app.services.llm_providers import BaseLLMProvider
from app.services.llm_providers.claude_provider import ClaudeProvider
from app.services.llm_providers.grok_provider import GrokProvider

logger = logging.getLogger(__name__)

class LLMProviderFactory:
    """Factory for creating and managing LLM providers"""
    
    def __init__(self):
        """Initialize the provider factory"""
        self._providers: Dict[str, Type[BaseLLMProvider]] = {
            "claude": ClaudeProvider,
            "anthropic": ClaudeProvider,  # Alias for claude
            "grok": GrokProvider,
            "xai": GrokProvider  # Alias for grok
        }
        self._instances: Dict[str, BaseLLMProvider] = {}
    
    def get_provider(self, provider_name: str) -> BaseLLMProvider:
        """
        Get a provider instance by name
        
        Args:
            provider_name: Name of the provider
            
        Returns:
            Provider instance
            
        Raises:
            ValueError: If provider is not supported
        """
        provider_name = provider_name.lower()
        
        # Check if we have a cached instance
        if provider_name in self._instances:
            return self._instances[provider_name]
        
        # Get provider class
        if provider_name not in self._providers:
            raise ValueError(f"Unsupported provider: {provider_name}")
        
        provider_class = self._providers[provider_name]
        
        # Create and cache instance
        try:
            instance = provider_class()
            self._instances[provider_name] = instance
            return instance
        except Exception as e:
            logger.error(f"Error creating provider {provider_name}: {str(e)}")
            raise
    
    def register_provider(self, name: str, provider_class: Type[BaseLLMProvider]):
        """
        Register a new provider
        
        Args:
            name: Name for the provider
            provider_class: Provider class to register
        """
        name = name.lower()
        self._providers[name] = provider_class
        # Clear cached instance if it exists
        if name in self._instances:
            del self._instances[name]
    
    def list_providers(self) -> Dict[str, str]:
        """
        List all registered providers
        
        Returns:
            Dictionary of provider names and their descriptions
        """
        return {
            name: provider.__doc__ or "No description available"
            for name, provider in self._providers.items()
        }

# Global provider factory instance
provider_factory = LLMProviderFactory() 