"""
Base template system for Model Context Protocol (MCP)
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.mcp_service import MCPContext, MCPMessage

class BaseTemplate(BaseModel):
    """Base class for all MCP templates"""
    name: str
    description: str
    version: str = "1.0.0"
    
    def create_base_context(self) -> MCPContext:
        """Create a base context with default system message"""
        raise NotImplementedError("Subclasses must implement create_base_context")
    
    def customize_context(self, context: MCPContext, customizations: Dict[str, Any]) -> MCPContext:
        """Apply customizations to the context"""
        raise NotImplementedError("Subclasses must implement customize_context")
    
    def validate_response(self, response: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """Validate the response against the template's schema"""
        raise NotImplementedError("Subclasses must implement validate_response")
    
    @property
    def expected_schema(self) -> Dict[str, Any]:
        """Get the expected JSON schema for responses"""
        raise NotImplementedError("Subclasses must implement expected_schema")

class TemplateRegistry:
    """Registry for managing available templates"""
    
    def __init__(self):
        self._templates: Dict[str, BaseTemplate] = {}
    
    def register(self, template: BaseTemplate):
        """Register a new template"""
        self._templates[template.name] = template
    
    def get_template(self, name: str) -> Optional[BaseTemplate]:
        """Get a template by name"""
        return self._templates.get(name)
    
    def list_templates(self) -> Dict[str, Dict[str, Any]]:
        """List all registered templates"""
        return {
            name: {
                "description": template.description,
                "version": template.version
            }
            for name, template in self._templates.items()
        }

# Global template registry
template_registry = TemplateRegistry() 