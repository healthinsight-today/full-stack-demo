import logging
import re
import json
from typing import Dict, Any, List, Optional, Tuple
from app.services.mcp_service import MCPService

# Set up logger
logger = logging.getLogger(__name__)

class DataVerifier:
    """
    Service for verifying and refining extracted medical data.
    
    This class provides methods to validate the structure and content of
    data extracted from medical reports, and to refine it when issues are found.
    """
    
    def __init__(self, mcp_service: Optional[MCPService] = None):
        """
        Initialize the data verifier.
        
        Args:
            mcp_service: Optional MCPService for refinement via LLM
        """
        self.mcp_service = mcp_service or MCPService()
        self.expected_fields = [
            "report_info", 
            "patient_info", 
            "test_sections", 
            "abnormal_parameters",
            "health_insights"
        ]
        
        # Define plausible ranges for common blood test parameters
        self.parameter_ranges = {
            "hemoglobin": (7, 20),         # g/dL
            "wbc": (2, 20),                # K/uL
            "rbc": (2, 7),                 # M/uL
            "platelets": (50, 500),        # K/uL
            "glucose": (40, 300),          # mg/dL
            "cholesterol": (100, 300),     # mg/dL
            "hdl": (20, 100),              # mg/dL
            "ldl": (40, 200),              # mg/dL
            "triglycerides": (40, 500),    # mg/dL
            "alt": (5, 200),               # U/L
            "ast": (5, 200),               # U/L
            "bun": (5, 50),                # mg/dL
            "creatinine": (0.4, 5),        # mg/dL
            "tsh": (0.1, 10),              # mIU/L
            "t4": (4, 12),                 # ug/dL
            "t3": (80, 200),               # ng/dL
            "vitamin_d": (10, 100),        # ng/mL
            "iron": (30, 200),             # ug/dL
            "ferritin": (10, 500),         # ng/mL
            "sodium": (120, 150),          # mmol/L
            "potassium": (3, 6),           # mmol/L
            "calcium": (8, 11),            # mg/dL
            "magnesium": (1, 3),           # mg/dL
            "phosphorus": (2, 5),          # mg/dL
            "albumin": (2, 6),             # g/dL
            "a1c": (4, 14),                # %
            "psa": (0, 10),                # ng/mL
        }
    
    async def verify_and_refine(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify and refine the health analysis data.
        
        Args:
            data: The health analysis data to verify and refine
            
        Returns:
            The verified and potentially refined data
        """
        logger.info("Verifying and refining health analysis data")
        validation_errors = []
        
        # Basic structure validation
        if not isinstance(data, dict):
            logger.error("Data is not a dictionary")
            return data
            
        # Check for required fields
        for field in self.expected_fields:
            if field not in data:
                validation_errors.append(f"Missing required field: {field}")
        
        # If no validation errors, return the original data
        if not validation_errors:
            logger.info("No validation errors found")
            return data
            
        # If there are validation errors, try to refine the data
        logger.info(f"Found {len(validation_errors)} validation errors, attempting refinement")
        
        try:
            # Create a system message for refinement
            system_message = """You are a medical data validator. Your task is to verify and refine structured 
            medical report data to ensure it meets the required format and contains valid information."""
            
            # Create a new context for refinement
            context = self.mcp_service.create_context(system_message=system_message)
            
            # Add the original data as a message
            user_message = f"""The following JSON represents a health report analysis with these issues:
            {json.dumps(validation_errors, indent=2)}
            
            Please fix the issues in this data:
            {json.dumps(data, indent=2)}
            
            Ensure the response is valid JSON with all required fields: 
            report_information, patient_info, test_sections, abnormal_parameters, and health_insights."""
            
            context = self.mcp_service.add_message(context, "user", user_message)
            
            # Create an MCP request for the refinement
            from app.services.mcp_service import MCPRequest
            request = MCPRequest(
                context=context,
                temperature=0.1  # Low temperature for consistent results
            )
            
            # Generate a response
            response = self.mcp_service.generate_response(request)
            
            # Extract the refined data from the response
            from app.services.llm_advanced_processor import LLMProcessor
            llm_processor = LLMProcessor()
            refined_data = llm_processor._extract_json(response.message.content)
            
            if refined_data:
                logger.info("Successfully refined data")
                return refined_data
            else:
                logger.warning("Failed to extract refined data from response")
                return data
                
        except Exception as e:
            logger.error(f"Error refining data: {str(e)}")
            return data
    
    def verify_and_refine_data(self, 
                               extracted_data: Dict[str, Any], 
                               original_text: str, 
                               context_id: Optional[str] = None) -> Tuple[Dict[str, Any], List[str], bool]:
        """
        Verify and refine extracted medical data.
        
        Args:
            extracted_data: The data extracted from the medical report
            original_text: The original text of the medical report
            context_id: Optional MCP context ID for refinement
            
        Returns:
            Tuple of (refined_data, validation_messages, was_refined)
        """
        validation_errors = []
        validation_warnings = []
        refinement_needed = False
        
        # 1. Check for required fields
        for field in self.expected_fields:
            if field not in extracted_data:
                validation_errors.append(f"Missing required field: {field}")
                refinement_needed = True
        
        # 2. Validate report_info structure if present
        if "report_info" in extracted_data:
            report_info = extracted_data["report_info"]
            if not isinstance(report_info, dict):
                validation_errors.append("report_info must be a dictionary")
                refinement_needed = True
            else:
                # Check for key fields
                for field in ["report_type", "report_date", "lab_name"]:
                    if field not in report_info:
                        validation_warnings.append(f"Missing report_info field: {field}")
        
        # 3. Validate patient_info structure if present
        if "patient_info" in extracted_data:
            patient_info = extracted_data["patient_info"]
            if not isinstance(patient_info, dict):
                validation_errors.append("patient_info must be a dictionary")
                refinement_needed = True
            else:
                # Check for key fields
                for field in ["name", "age", "gender"]:
                    if field not in patient_info:
                        validation_warnings.append(f"Missing patient_info field: {field}")
                
                # Check age is plausible if present
                if "age" in patient_info:
                    try:
                        age = float(patient_info["age"])
                        if not 0 <= age <= 120:
                            validation_warnings.append(f"Implausible age: {age}")
                    except (ValueError, TypeError):
                        # Age might be a string like "45 years"
                        pass
        
        # 4. Validate test_sections structure if present
        if "test_sections" in extracted_data:
            test_sections = extracted_data["test_sections"]
            if not isinstance(test_sections, list):
                validation_errors.append("test_sections must be a list")
                refinement_needed = True
            elif len(test_sections) == 0:
                validation_warnings.append("test_sections list is empty")
            else:
                # Check each test section
                for i, section in enumerate(test_sections):
                    if not isinstance(section, dict):
                        validation_errors.append(f"Test section {i} must be a dictionary")
                        refinement_needed = True
                        continue
                    
                    if "section_name" not in section:
                        validation_warnings.append(f"Missing section_name in test section {i}")
                    
                    if "parameters" not in section:
                        validation_errors.append(f"Missing parameters in test section {i}")
                        refinement_needed = True
                        continue
                    
                    if not isinstance(section["parameters"], list):
                        validation_errors.append(f"parameters in test section {i} must be a list")
                        refinement_needed = True
                        continue
                    
                    # Check each parameter in the section
                    for j, param in enumerate(section["parameters"]):
                        if not isinstance(param, dict):
                            validation_errors.append(f"Parameter {j} in section {i} must be a dictionary")
                            refinement_needed = True
                            continue
                        
                        # Check required fields
                        for field in ["name", "value"]:
                            if field not in param:
                                validation_errors.append(f"Missing {field} in parameter {j}, section {i}")
                                refinement_needed = True
                        
                        # Check value plausibility if possible
                        if "name" in param and "value" in param:
                            param_name = param["name"].lower().replace(" ", "_")
                            param_value = param["value"]
                            
                            # Try to extract numeric value
                            numeric_value = self._extract_numeric_value(param_value)
                            if numeric_value is not None:
                                # Check against known ranges if available
                                for known_param, (min_val, max_val) in self.parameter_ranges.items():
                                    if known_param in param_name or param_name in known_param:
                                        if not min_val <= numeric_value <= max_val:
                                            validation_warnings.append(
                                                f"Unusual value {numeric_value} for {param['name']}. "
                                                f"Expected range: {min_val}-{max_val}"
                                            )
        
        # 5. Validate abnormal_parameters structure if present
        if "abnormal_parameters" in extracted_data:
            abnormal_params = extracted_data["abnormal_parameters"]
            if not isinstance(abnormal_params, list):
                validation_errors.append("abnormal_parameters must be a list")
                refinement_needed = True
                
        # 6. Validate health_insights structure if present
        if "health_insights" in extracted_data:
            health_insights = extracted_data["health_insights"]
            if not isinstance(health_insights, (dict, list)):
                validation_errors.append("health_insights must be a dictionary or list")
                refinement_needed = True
        
        # Combine all validation messages
        validation_messages = validation_errors + validation_warnings
        
        # If refinement is needed and we have a context_id, refine the data
        if refinement_needed and context_id:
            return self._refine_data(extracted_data, original_text, context_id, validation_errors), validation_messages, True
        
        # Otherwise return the original data with validation messages
        return extracted_data, validation_messages, False
    
    def _refine_data(self, 
                    extracted_data: Dict[str, Any], 
                    original_text: str, 
                    context_id: str, 
                    validation_errors: List[str]) -> Dict[str, Any]:
        """
        Refine the extracted data using the MCP service.
        
        Args:
            extracted_data: The data extracted from the medical report
            original_text: The original text of the medical report
            context_id: The MCP context ID
            validation_errors: List of validation errors
            
        Returns:
            Refined data
        """
        try:
            # Get the existing context
            context = self.mcp_service.get_context(context_id)
            
            # Create feedback message
            error_list = "\n".join(f"- {error}" for error in validation_errors)
            feedback = (
                f"The extracted data has the following issues that need to be fixed:\n"
                f"{error_list}\n\n"
                f"Please correct these issues and provide a complete, valid JSON response."
            )
            
            # Add feedback to context
            context = self.mcp_service.add_message(context, "user", feedback)
            
            # Generate refined response
            from app.services.mcp_service import MCPRequest
            
            # Create MCPRequest for generating response
            mcp_request = MCPRequest(
                context=context,
                temperature=0.1,  # Low temperature for consistent formatting
            )
            
            # Generate response using MCP
            mcp_response = self.mcp_service.generate_response(mcp_request)
            
            # Extract JSON from MCP response
            from app.services.llm_advanced_processor import LLMProcessor
            llm_processor = LLMProcessor()
            
            # Try to parse the content as JSON
            content = mcp_response.message.content
            
            # Use the LLMProcessor's JSON extraction capabilities
            refined_data = llm_processor._extract_json(content)
            
            # If successful, return the refined data
            return refined_data
            
        except Exception as e:
            logger.error(f"Error refining data: {str(e)}")
            # If refinement fails, return the original data
            return extracted_data
    
    def _extract_numeric_value(self, value_string: Any) -> Optional[float]:
        """
        Extract a numeric value from a string or other value.
        
        Args:
            value_string: The value to extract a number from
            
        Returns:
            Extracted float or None if extraction fails
        """
        if isinstance(value_string, (int, float)):
            return float(value_string)
        
        if not isinstance(value_string, str):
            return None
        
        # Try to extract numeric part from strings like "120 mg/dL" or "7.2 g/dL"
        numeric_match = re.search(r'(\d+\.?\d*)', value_string)
        if numeric_match:
            try:
                return float(numeric_match.group(1))
            except (ValueError, TypeError):
                return None
        
        return None 