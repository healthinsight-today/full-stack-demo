"""
Specialist service for healthcare provider recommendations
"""

import json
import logging
import os
import datetime
import random
from typing import Dict, Any, List, Optional
from pathlib import Path

from app.config import settings
from app.models.schemas import SpecialistsResponse, Specialist

# Configure logger
logger = logging.getLogger(__name__)

def get_report_data(run_id: str) -> Dict[str, Any]:
    """
    Load the analysis data for a given run_id
    """
    try:
        analysis_file = Path(settings.PROCESSED_DIR) / f"{run_id}_analysis.json"
        if not analysis_file.exists():
            logger.warning(f"Analysis file not found for run_id: {run_id}")
            return {}
        
        with open(analysis_file, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading analysis data for run_id {run_id}: {e}")
        return {}

def get_specialist_by_specialty(specialty: str, location: str) -> List[Specialist]:
    """
    Get specialists filtered by specialty and location
    
    Args:
        specialty: The medical specialty (e.g., 'cardiologist')
        location: User's location for regional recommendations
        
    Returns:
        List of specialist recommendations
    """
    # Database of mock specialists organized by specialty
    specialists_db = {
        "cardiologist": [
            Specialist(
                name="Dr. Sarah Chen",
                specialty="Cardiology",
                location="Boston, MA",
                contact="617-555-1234",
                available_days=["Monday", "Wednesday", "Friday"],
                notes="Specializes in preventive cardiology and women's heart health"
            ),
            Specialist(
                name="Dr. Michael Rodriguez",
                specialty="Cardiology",
                location="New York, NY",
                contact="212-555-9876",
                available_days=["Tuesday", "Thursday"],
                notes="Board certified in interventional cardiology"
            ),
            Specialist(
                name="Dr. Robert Johnson",
                specialty="Cardiology",
                location="Chicago, IL",
                contact="312-555-6543",
                available_days=["Monday", "Tuesday", "Thursday"],
                notes="Specializes in heart failure management"
            )
        ],
        "endocrinologist": [
            Specialist(
                name="Dr. Emily Wong",
                specialty="Endocrinology",
                location="San Francisco, CA",
                contact="415-555-7890",
                available_days=["Monday", "Wednesday", "Friday"],
                notes="Specializes in diabetes management and thyroid disorders"
            ),
            Specialist(
                name="Dr. James Miller",
                specialty="Endocrinology",
                location="Seattle, WA",
                contact="206-555-4321",
                available_days=["Tuesday", "Thursday", "Friday"],
                notes="Focus on metabolic disorders and hormone replacement therapy"
            )
        ],
        "nutritionist": [
            Specialist(
                name="Lisa Peterson, RD",
                specialty="Nutrition",
                location="Denver, CO",
                contact="303-555-8765",
                available_days=["Monday", "Wednesday", "Friday"],
                notes="Specializes in plant-based nutrition and heart health"
            ),
            Specialist(
                name="Mark Williams, RD",
                specialty="Nutrition",
                location="Portland, OR",
                contact="503-555-2345",
                available_days=["Tuesday", "Thursday"],
                notes="Sports nutrition and metabolic health expert"
            )
        ],
        "neurologist": [
            Specialist(
                name="Dr. Nina Patel",
                specialty="Neurology",
                location="Los Angeles, CA",
                contact="310-555-9876",
                available_days=["Monday", "Tuesday", "Thursday"],
                notes="Specializes in headache disorders and neuro-immunology"
            ),
            Specialist(
                name="Dr. Thomas Wright",
                specialty="Neurology",
                location="Philadelphia, PA",
                contact="215-555-6789",
                available_days=["Wednesday", "Friday"],
                notes="Focus on movement disorders and Parkinson's disease"
            )
        ],
        "dermatologist": [
            Specialist(
                name="Dr. Aisha Johnson",
                specialty="Dermatology",
                location="Miami, FL",
                contact="305-555-3456",
                available_days=["Monday", "Wednesday", "Friday"],
                notes="Specializes in skin cancer screening and cosmetic dermatology"
            ),
            Specialist(
                name="Dr. David Kim",
                specialty="Dermatology",
                location="Atlanta, GA",
                contact="404-555-7654",
                available_days=["Tuesday", "Thursday"],
                notes="Expert in treating psoriasis and eczema"
            )
        ]
    }
    
    # Normalize specialty input
    specialty_lower = specialty.lower() if specialty else ""
    location_lower = location.lower()
    
    # Find matching specialists
    matched_specialists = []
    
    if specialty:
        # Match to specific specialty
        for db_specialty, specialists in specialists_db.items():
            if specialty_lower in db_specialty or db_specialty in specialty_lower:
                # Filter by location or return all if no location match
                for specialist in specialists:
                    specialist_location = specialist.location.lower()
                    if any(city in specialist_location for city in location_lower.split(",")):
                        matched_specialists.append(specialist)
    else:
        # No specialty specified, return a mix of specialists
        for specialists in specialists_db.values():
            for specialist in specialists:
                specialist_location = specialist.location.lower()
                if any(city in specialist_location for city in location_lower.split(",")) or random.random() < 0.3:
                    matched_specialists.append(specialist)
                    
                # Limit to 5 specialists when not filtering by specialty
                if len(matched_specialists) >= 5:
                    break
    
    # If no matches, return a generic list
    if not matched_specialists:
        matched_specialists = [
            Specialist(
                name="Dr. General Practitioner",
                specialty="Primary Care",
                location=f"Near {location}",
                contact="Please call your insurance provider for in-network options",
                available_days=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                notes="Recommended to establish care with a primary provider first"
            )
        ]
    
    return matched_specialists

def get_mock_specialists(run_id: str, specialty: Optional[str], location: str) -> SpecialistsResponse:
    """
    Generate mock specialist recommendations based on run_id, specialty, and location
    
    Args:
        run_id: The unique identifier for the analysis run
        specialty: Optional medical specialty to filter by
        location: User's location for regional recommendations
        
    Returns:
        SpecialistsResponse with mock specialist recommendations
    """
    # Load the original analysis to get user_id and medical_report_id
    report_data = get_report_data(run_id)
    user_id = report_data.get("patient_information", {}).get("patient_id", None)
    medical_report_id = report_data.get("patient_information", {}).get("registration_no", None)
    
    # Get specialists based on specialty and location
    specialists = get_specialist_by_specialty(specialty, location)
    
    # Create metadata
    now = datetime.datetime.now()
    metadata = {
        "generated_at": now.isoformat(),
        "specialty_filter": specialty,
        "location": location,
        "total_results": len(specialists)
    }
    
    # Create response
    response = SpecialistsResponse(
        run_id=run_id,
        user_id=user_id,
        medical_report_id=medical_report_id,
        metadata=metadata,
        specialists=specialists
    )
    
    return response 