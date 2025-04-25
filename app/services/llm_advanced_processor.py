import os
import json
import logging
import requests
import time
import datetime
from typing import Dict, Any, Optional, List
from app.config import settings
from openai import OpenAI
from fastapi import HTTPException

# Set up logger
logger = logging.getLogger(__name__)

class LLMProcessor:
    """
    A class to process text with LLM APIs and extract structured data.
    Supports multiple providers including Anthropic Claude and Grok (xAI).
    """
    
    def __init__(self, 
                 provider: str = "claude", 
                 model: Optional[str] = None,
                 temperature: float = 0.1):
        """Initialize the processor with API keys and model configurations.
        
        Args:
            provider: The LLM provider to use (claude, grok)
            model: The specific model to use (optional, will use default if not specified)
            temperature: The temperature to use for generation (default: 0.1)
        """
        self.provider = provider.lower()
        self.temperature = temperature
        
        # Set default model based on provider if not specified
        if model is None:
            if self.provider == "claude" or self.provider == "anthropic":
                self.model = settings.ANTHROPIC_MODEL
            elif self.provider in ["grok", "xai"]:
                self.model = settings.GROK_MODEL
            else:
                # Default to Claude if provider is not recognized
                self.provider = "claude"
                self.model = settings.ANTHROPIC_MODEL
        else:
            self.model = model
            
        # Set API keys and URLs based on provider
        if self.provider == "claude" or self.provider == "anthropic":
            self.api_key = settings.ANTHROPIC_API_KEY
            self.api_url = settings.ANTHROPIC_API_URL
        elif self.provider in ["grok", "xai"]:
            self.api_key = settings.GROK_API_KEY
            self.api_url = settings.GROK_API_URL
        
        logger.info(f"LLMProcessor initialized with provider: {self.provider}, model: {self.model}")
        
        # Initialize OpenAI client for Grok API
        self.grok_client = OpenAI(
            api_key=self.api_key,
            base_url=self.api_url,
        )
        
        # Validate that required keys are available
        if not self.api_key:
            logger.warning("No LLM API key configured. Please set the appropriate environment variable.")
    
    async def process_medical_report(self, text: str) -> Dict[str, Any]:
        """Process a medical report text into structured data.
        
        This method:
        1. Processes the text with the appropriate LLM API
        2. Parses the JSON response
        3. Adds metadata about processing time and the model used
        
        Args:
            text: The medical report text to process
            
        Returns:
            A dictionary containing the structured data
        """
        start_time = time.time()
        
        # Process with the appropriate LLM API
        if self.provider == "claude" or self.provider == "anthropic":
            response_content = await self._process_with_claude(text)
        elif self.provider in ["grok", "xai"]:
            response_content = await self._process_with_grok(text)
        else:
            # Default to Claude
            response_content = await self._process_with_claude(text)
        
        # Extract and clean JSON from the response
        result = self._extract_json(response_content)
        
        # Add metadata
        end_time = time.time()
        processing_time = round(end_time - start_time, 2)
        
        # Add metadata to result
        result["metadata"] = {
            "processing_time_seconds": processing_time,
            "model": self.model,
            "provider": self.provider,
            "timestamp": datetime.datetime.now().isoformat(),
        }
        
        return result
    
    async def _process_with_claude(self, text: str) -> str:
        """Process text with Claude API.
        
        Args:
            text: The text to process
            
        Returns:
            The model's response as a string
        """
        if not self.api_key:
            raise HTTPException(status_code=500, detail="Claude API key not configured")
        
        # System message to instruct the model
        system_message = (
            "You are an AI assistant specialized in analyzing medical blood test reports. "
            "Your task is to extract structured information from the blood test report text and return it in a specific JSON format. "
            "The JSON should include these main sections: "
            "1. 'report_information': General information about the report including date, laboratory, and doctor. "
            "2. 'patient_information': Details about the patient including name, age, gender, and patient ID. "
            "3. 'test_sections': All test categories and parameters with their values, reference ranges, and units. "
            "4. 'abnormal_parameters': A list of all abnormal values with their details. "
            "5. 'health_insights': Clinical interpretation of results and recommendations. "
            "Please ensure all JSON is valid, and extract as much information as possible from the provided text. "
            "DO NOT include any explanatory text in your response - ONLY return the JSON object."
        )
        
        # Prepare the request payload
        payload = {
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": 4000,
            "system": system_message,
            "messages": [
                {
                    "role": "user",
                    "content": (
                        f"Please analyze this blood test report and extract the structured information into JSON format:\n\n{text}"
                    )
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            response_data = response.json()
            
            if "content" in response_data and len(response_data["content"]) > 0:
                return response_data["content"][0]["text"]
            else:
                logger.error(f"Unexpected Claude API response structure: {response_data}")
                raise HTTPException(status_code=500, detail="Unexpected API response structure")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Claude API request failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Claude API request failed: {str(e)}")

    async def _process_with_grok(self, text: str) -> str:
        """Process text with Grok/xAI API.
        
        Args:
            text: The text to process
            
        Returns:
            The model's response as a string
        """
        if not self.api_key:
            raise HTTPException(status_code=500, detail="Grok API key not configured")
        
        # Use the OpenAI client which is compatible with xAI API
        try:
            from openai import OpenAI
            
            # Initialize client with xAI base URL
            client = OpenAI(
                api_key=self.api_key,
                base_url="https://api.x.ai/v1",
                timeout=90.0  # Increase timeout to 90 seconds
            )
            
            # System message to instruct the model
            system_message = (
                "You are an AI assistant specialized in analyzing medical blood test reports. "
                "Your task is to extract structured information from the blood test report text and return it in a specific JSON format. "
                "The JSON should include these main sections: "
                "1. 'report_information': General information about the report including date, laboratory, and doctor. "
                "2. 'patient_information': Details about the patient including name, age, gender, and patient ID. "
                "3. 'test_sections': All test categories and parameters with their values, reference ranges, and units. "
                "4. 'abnormal_parameters': A list of all abnormal values with their details. "
                "5. 'health_insights': Clinical interpretation of results and recommendations. "
                "Please ensure all JSON is valid, and extract as much information as possible from the provided text. "
                "DO NOT include any explanatory text in your response - ONLY return the JSON object."
            )
            
            user_message = (
                f"Please analyze this blood test report and extract the structured information into JSON format. "
                f"Respond ONLY with valid JSON, no other text:\n\n{text}"
            )
            
            # Retry logic for API calls
            max_retries = 3
            retry_delay = 5  # seconds
            
            for attempt in range(max_retries):
                try:
                    logger.info(f"Making request to xAI/Grok API (attempt {attempt+1}/{max_retries})")
                    
                    # Make the API call
                    completion = client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": user_message}
                        ],
                        temperature=self.temperature,
                    )
                    
                    # Extract the response content
                    response_content = completion.choices[0].message.content
                    
                    logger.info("Successfully received response from xAI/Grok API")
                    return response_content
                    
                except Exception as e:
                    logger.error(f"Attempt {attempt+1}/{max_retries} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        import asyncio
                        logger.info(f"Retrying in {retry_delay} seconds...")
                        await asyncio.sleep(retry_delay)
                        # Increase delay for next attempt
                        retry_delay *= 2
                    else:
                        # Last attempt failed, return error as JSON
                        logger.error(f"All {max_retries} attempts failed. Last error: {str(e)}")
                        return json.dumps({
                            "error": f"Failed to get response from xAI/Grok API after {max_retries} attempts",
                            "last_error": str(e),
                            "timestamp": datetime.datetime.now().isoformat()
                        })
            
        except ImportError as e:
            logger.error(f"Failed to import OpenAI client: {str(e)}")
            return json.dumps({
                "error": "OpenAI client not available. Please install with 'pip install openai'",
                "details": str(e),
                "timestamp": datetime.datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Unexpected error in _process_with_grok: {str(e)}")
            return json.dumps({
                "error": f"Unexpected error: {str(e)}",
                "timestamp": datetime.datetime.now().isoformat()
            })

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract and parse JSON from a text response.
        
        This method attempts to:
        1. Find JSON content within the text
        2. Parse it into a Python dictionary
        3. If parsing fails, attempt to repair common JSON issues
        
        Args:
            text: The text containing JSON
            
        Returns:
            A dictionary parsed from the JSON
        """
        # Try to find JSON content if surrounded by other text
        json_match = None
        
        # Look for content between triple backticks
        import re
        json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
        matches = re.findall(json_pattern, text)
        
        if matches:
            # Use the first match that parses as valid JSON
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    json_match = match  # Save the match for repair attempts
        else:
            # If no triple backtick match, try the whole text
            json_match = text
        
        # Try parsing the whole text or the best match
        try:
            return json.loads(json_match)
        except (json.JSONDecodeError, TypeError):
            # If parsing fails, try to repair common JSON issues
            repaired_json = self._repair_json(json_match)
            return repaired_json
    
    def _repair_json(self, text: str) -> Dict[str, Any]:
        """Attempt to repair malformed JSON.
        
        Args:
            text: The malformed JSON text
            
        Returns:
            A dictionary parsed from the repaired JSON
        """
        if text is None:
            return {}
            
        # Common JSON repair strategies
        try:
            # 1. Try to fix unescaped quotes and invalid control characters
            text = text.replace('\\', '\\\\')  # Escape backslashes first
            text = text.replace('\\"', '\\\\"')  # Re-escape already escaped quotes
            text = text.replace('""', '"')  # Fix double quotes
            text = text.replace("'", '"')  # Replace single quotes with double quotes
            text = re.sub(r'(?<!\\)"(?=.*?:)', r'\"', text)  # Escape unescaped quotes before colons
            text = re.sub(r'\n|\r|\t', ' ', text)  # Replace newlines and tabs with spaces
            
            # 2. Check for missing outer braces
            text = text.strip()
            if not (text.startswith('{') and text.endswith('}')):
                text = '{' + text + '}'
            
            # Try parsing again
            return json.loads(text)
        except Exception as e:
            logger.error(f"JSON repair failed: {str(e)}")
            
            # If all repair attempts fail, return a structured error
            return {
                "error": "Failed to parse response into valid JSON",
                "partial_content": text[:500] + ("..." if len(text) > 500 else ""),
                "timestamp": datetime.datetime.now().isoformat()
            }

    # Add method for backward compatibility with older code
    def _attempt_json_repair(self, json_str: str) -> str:
        """
        Backward compatibility method to repair malformed JSON strings.
        
        Args:
            json_str: Potentially malformed JSON string
            
        Returns:
            Repaired JSON string that can be parsed with json.loads()
        """
        # Use the _repair_json method but return the result as a string
        repaired_dict = self._repair_json(json_str)
        
        # If there was an error, extract the partial content
        if "error" in repaired_dict:
            return json_str  # Return original if repair failed
        
        # Otherwise return the dict as a JSON string
        return json.dumps(repaired_dict)

    def get_providers_info(self) -> Dict[str, Any]:
        """
        Get information about available LLM providers
        
        Returns:
            Dict with information about available providers
        """
        providers = []
        
        # Check if Claude API key is available
        if settings.ANTHROPIC_API_KEY:
            providers.append({
                "id": "claude",
                "name": "Anthropic Claude",
                "status": "available",
                "models": [
                    {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"},
                    {"id": "claude-3-sonnet-20240229", "name": "Claude 3 Sonnet"},
                    {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku"}
                ],
                "default_model": settings.ANTHROPIC_MODEL
            })
        else:
            providers.append({
                "id": "claude",
                "name": "Anthropic Claude",
                "status": "unavailable",
                "reason": "API key not configured"
            })
        
        # Check if Grok API key is available
        if settings.GROK_API_KEY:
            providers.append({
                "id": "grok",
                "name": "Grok API (xAI)",
                "status": "available",
                "models": [
                    {"id": "grok-3", "name": "Grok 3"},
                    {"id": "grok-3-latest", "name": "Grok 3 (Latest)"},
                    {"id": "grok-2", "name": "Grok 2"},
                    {"id": "grok-1", "name": "Grok 1"}
                ],
                "default_model": settings.GROK_MODEL
            })
            
            # Add xAI as an alias for Grok
            providers.append({
                "id": "xai",
                "name": "xAI (alias for Grok)",
                "status": "available",
                "models": [
                    {"id": "grok-3", "name": "Grok 3"},
                    {"id": "grok-3-latest", "name": "Grok 3 (Latest)"},
                    {"id": "grok-2", "name": "Grok 2"},
                    {"id": "grok-1", "name": "Grok 1"}
                ],
                "default_model": settings.GROK_MODEL,
                "alias_for": "grok"
            })
        else:
            providers.append({
                "id": "grok",
                "name": "Grok API (xAI)",
                "status": "unavailable",
                "reason": "API key not configured"
            })
            
            providers.append({
                "id": "xai",
                "name": "xAI (alias for Grok)",
                "status": "unavailable",
                "reason": "API key not configured",
                "alias_for": "grok"
            })
        
        return {"providers": providers} 