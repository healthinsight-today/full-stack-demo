"""
Template for medical report analysis
"""

from typing import Dict, Any, Optional
from copy import deepcopy
import json

from app.services.mcp_service import MCPContext, MCPMessage
from app.services.templates import BaseTemplate, template_registry

class AnalysisTemplate(BaseTemplate):
    name: str = "analysis"
    description: str = "Template for analyzing medical reports and extracting structured data"
    version: str = "1.0.0"
    
    def create_base_context(self) -> MCPContext:
        """Create base context for medical report analysis"""
        context = MCPContext()
        
        # Add comprehensive system message
        context.messages.append(
            MCPMessage(
                role="system",
                content="""You are an AI medical assistant specialized in analyzing medical reports, particularly blood test results.
                Your task is to extract structured information and provide insights in a specific JSON format.
                
                Key responsibilities:
                1. Extract report metadata (date, lab, doctor)
                2. Identify patient information
                3. Parse all test parameters with their values and reference ranges
                4. Flag abnormal values and their significance
                5. Provide health insights and recommendations
                
                The response must be valid JSON with the following structure:
                {
                    "report_info": {
                        "report_id": string,
                        "report_type": string,
                        "report_date": string (YYYY-MM-DD),
                        "laboratory": string,
                        "doctor": string (if available)
                    },
                    "patient_info": {
                        "name": string,
                        "age": number (if available),
                        "gender": string (if available),
                        "patient_id": string (if available)
                    },
                    "test_sections": [
                        {
                            "name": string,
                            "parameters": [
                                {
                                    "name": string,
                                    "value": number | string,
                                    "unit": string,
                                    "reference_range": string,
                                    "is_abnormal": boolean,
                                    "direction": "high" | "low" | null
                                }
                            ]
                        }
                    ],
                    "abnormal_parameters": [
                        {
                            "name": string,
                            "value": number | string,
                            "unit": string,
                            "reference_range": string,
                            "direction": "high" | "low",
                            "significance": string,
                            "possible_causes": [string]
                        }
                    ],
                    "health_insights": {
                        "summary": string,
                        "conditions": [
                            {
                                "name": string,
                                "confidence": number (0-1),
                                "related_parameters": [string],
                                "description": string,
                                "recommendations": [
                                    {
                                        "type": "dietary" | "lifestyle" | "medical" | "testing",
                                        "description": string,
                                        "urgency": "immediate" | "soon" | "routine"
                                    }
                                ]
                            }
                        ],
                        "general_recommendations": [string]
                    }
                }
                
                IMPORTANT:
                - Only return valid JSON
                - Include all required fields
                - Use null for missing optional values
                - Ensure all numbers are properly formatted
                - Do not include any explanatory text outside the JSON"""
            )
        )
        
        return context
    
    def customize_context(self, context: MCPContext, customizations: Dict[str, Any]) -> MCPContext:
        """Apply customizations to the analysis context"""
        updated_context = deepcopy(context)
        
        # Handle custom system message additions
        if "system_message_append" in customizations:
            system_message = updated_context.messages[0]
            system_message.content += f"\n\nAdditional Instructions:\n{customizations['system_message_append']}"
        
        # Handle focus areas
        if "focus_areas" in customizations:
            focus_areas = customizations["focus_areas"]
            focus_message = "\n\nPlease pay special attention to the following areas:\n"
            for area in focus_areas:
                focus_message += f"- {area}\n"
            system_message = updated_context.messages[0]
            system_message.content += focus_message
        
        # Handle custom validation rules
        if "validation_rules" in customizations:
            if "metadata" not in updated_context.metadata:
                updated_context.metadata["validation_rules"] = {}
            updated_context.metadata["validation_rules"].update(customizations["validation_rules"])
        
        return updated_context
    
    def validate_response(self, response: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """Validate the analysis response against the expected schema"""
        try:
            # Check required top-level keys
            required_keys = ["report_info", "patient_info", "test_sections", "abnormal_parameters", "health_insights"]
            for key in required_keys:
                if key not in response:
                    return False, f"Missing required key: {key}"
            
            # Validate report_info
            report_info = response["report_info"]
            if not isinstance(report_info, dict):
                return False, "report_info must be a dictionary"
            if "report_id" not in report_info or "report_type" not in report_info:
                return False, "report_info missing required fields"
            
            # Validate patient_info
            patient_info = response["patient_info"]
            if not isinstance(patient_info, dict):
                return False, "patient_info must be a dictionary"
            if "name" not in patient_info:
                return False, "patient_info missing required name field"
            
            # Validate test_sections
            test_sections = response["test_sections"]
            if not isinstance(test_sections, list):
                return False, "test_sections must be a list"
            for section in test_sections:
                if not isinstance(section, dict):
                    return False, "Each test section must be a dictionary"
                if "name" not in section or "parameters" not in section:
                    return False, "Test section missing required fields"
                if not isinstance(section["parameters"], list):
                    return False, "Test section parameters must be a list"
            
            # Validate abnormal_parameters
            abnormal_parameters = response["abnormal_parameters"]
            if not isinstance(abnormal_parameters, list):
                return False, "abnormal_parameters must be a list"
            
            # Validate health_insights
            health_insights = response["health_insights"]
            if not isinstance(health_insights, dict):
                return False, "health_insights must be a dictionary"
            if "summary" not in health_insights or "conditions" not in health_insights:
                return False, "health_insights missing required fields"
            
            return True, None
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    @property
    def expected_schema(self) -> Dict[str, Any]:
        """Get the expected JSON schema for analysis responses"""
        return {
            "type": "object",
            "required": ["report_info", "patient_info", "test_sections", "abnormal_parameters", "health_insights"],
            "properties": {
                "report_info": {
                    "type": "object",
                    "required": ["report_id", "report_type", "report_date"],
                    "properties": {
                        "report_id": {"type": "string"},
                        "report_type": {"type": "string"},
                        "report_date": {"type": "string", "format": "date"},
                        "laboratory": {"type": "string"},
                        "doctor": {"type": ["string", "null"]}
                    }
                },
                "patient_info": {
                    "type": "object",
                    "required": ["name"],
                    "properties": {
                        "name": {"type": "string"},
                        "age": {"type": ["number", "null"]},
                        "gender": {"type": ["string", "null"]},
                        "patient_id": {"type": ["string", "null"]}
                    }
                },
                "test_sections": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["name", "parameters"],
                        "properties": {
                            "name": {"type": "string"},
                            "parameters": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["name", "value", "unit", "is_abnormal"],
                                    "properties": {
                                        "name": {"type": "string"},
                                        "value": {"type": ["number", "string"]},
                                        "unit": {"type": "string"},
                                        "reference_range": {"type": "string"},
                                        "is_abnormal": {"type": "boolean"},
                                        "direction": {"type": ["string", "null"], "enum": ["high", "low", null]}
                                    }
                                }
                            }
                        }
                    }
                },
                "abnormal_parameters": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["name", "value", "direction"],
                        "properties": {
                            "name": {"type": "string"},
                            "value": {"type": ["number", "string"]},
                            "unit": {"type": "string"},
                            "reference_range": {"type": "string"},
                            "direction": {"type": "string", "enum": ["high", "low"]},
                            "significance": {"type": "string"},
                            "possible_causes": {"type": "array", "items": {"type": "string"}}
                        }
                    }
                },
                "health_insights": {
                    "type": "object",
                    "required": ["summary", "conditions"],
                    "properties": {
                        "summary": {"type": "string"},
                        "conditions": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["name", "confidence", "description"],
                                "properties": {
                                    "name": {"type": "string"},
                                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                                    "related_parameters": {"type": "array", "items": {"type": "string"}},
                                    "description": {"type": "string"},
                                    "recommendations": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "required": ["type", "description"],
                                            "properties": {
                                                "type": {"type": "string", "enum": ["dietary", "lifestyle", "medical", "testing"]},
                                                "description": {"type": "string"},
                                                "urgency": {"type": "string", "enum": ["immediate", "soon", "routine"]}
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "general_recommendations": {"type": "array", "items": {"type": "string"}}
                    }
                }
            }
        }

# Register the template
template_registry.register(AnalysisTemplate()) 