"""
Template for implementing MongoDB context in FastAPI endpoints

This file provides template examples for integrating MongoDB context
middleware into all FastAPI endpoints consistently.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Path, HTTPException, Request

# Import context dependencies
from app.middleware.mongodb_context import mongodb_request_context
from app.middleware.base_context import BaseContextManager, get_context_manager
from app.services.auth_service import get_current_active_user

# Configure logger
logger = logging.getLogger(__name__)

# Example context manager for a specific resource
class ResourceContextManager(BaseContextManager):
    """Context manager for resource-specific operations"""
    RESOURCE_TYPE = "resource"
    
    async def get_resource(self, resource_id: str) -> Dict[str, Any]:
        """Get resource within MongoDB context"""
        return await self.with_context("get", resource_id)
    
    async def list_resources(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """List resources within MongoDB context"""
        return await self.with_context("list", details=filters)
    
    async def create_resource(self, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create resource within MongoDB context"""
        return await self.with_context("create", details=resource_data)
    
    async def update_resource(self, resource_id: str, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update resource within MongoDB context"""
        return await self.with_context("update", resource_id, details=resource_data)
    
    async def delete_resource(self, resource_id: str) -> Dict[str, Any]:
        """Delete resource within MongoDB context"""
        return await self.with_context("delete", resource_id)

# Create dependency provider
get_resource_context = get_context_manager(ResourceContextManager)

# Create router
router = APIRouter(tags=["Resources"])

# Example endpoint implementations

@router.get("", response_model=Dict[str, Any])
async def list_resources(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """
    List resources with pagination
    """
    # Prepare filters for context tracking
    filters = {
        "page": page,
        "per_page": per_page,
        "search": search
    }
    
    async with mongodb_request_context(request, "resource", "list") as context:
        try:
            # Get resources with context tracking
            await resource_context.list_resources(filters)
            
            # Actual resource retrieval logic
            # resources = await get_resources(page, per_page, search)
            resources = []  # Replace with actual implementation
            
            return {
                "success": True,
                "data": resources,
                "page": page,
                "count": len(resources)
            }
        except Exception as e:
            logger.error(f"Error listing resources: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/{resource_id}", response_model=Dict[str, Any])
async def get_resource(
    request: Request,
    resource_id: str = Path(..., description="Resource ID"),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """
    Get resource by ID
    """
    async with mongodb_request_context(request, "resource", "get", resource_id) as context:
        try:
            # Get resource with context tracking
            await resource_context.get_resource(resource_id)
            
            # Actual resource retrieval logic
            # resource = await get_resource_by_id(resource_id)
            resource = {}  # Replace with actual implementation
            
            if not resource:
                raise HTTPException(status_code=404, detail="Resource not found")
                
            return {
                "success": True,
                "data": resource
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting resource: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=Dict[str, Any])
async def create_resource(
    request: Request,
    resource_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """
    Create a new resource
    """
    async with mongodb_request_context(request, "resource", "create") as context:
        try:
            # Create resource with context tracking
            await resource_context.create_resource(resource_data)
            
            # Add user ID to resource data
            resource_data["user_id"] = str(current_user["_id"])
            
            # Actual resource creation logic
            # new_resource = await create_new_resource(resource_data)
            new_resource = {"id": "new-resource-id"}  # Replace with actual implementation
            
            return {
                "success": True,
                "data": new_resource,
                "message": "Resource created successfully"
            }
        except Exception as e:
            logger.error(f"Error creating resource: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.put("/{resource_id}", response_model=Dict[str, Any])
async def update_resource(
    request: Request,
    resource_id: str,
    resource_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """
    Update an existing resource
    """
    async with mongodb_request_context(request, "resource", "update", resource_id) as context:
        try:
            # Update resource with context tracking
            await resource_context.update_resource(resource_id, resource_data)
            
            # Actual resource update logic
            # updated_resource = await update_existing_resource(resource_id, resource_data)
            updated_resource = {"id": resource_id}  # Replace with actual implementation
            
            return {
                "success": True,
                "data": updated_resource,
                "message": "Resource updated successfully"
            }
        except Exception as e:
            logger.error(f"Error updating resource: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{resource_id}", response_model=Dict[str, Any])
async def delete_resource(
    request: Request,
    resource_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """
    Delete a resource
    """
    async with mongodb_request_context(request, "resource", "delete", resource_id) as context:
        try:
            # Delete resource with context tracking
            await resource_context.delete_resource(resource_id)
            
            # Actual resource deletion logic
            # success = await delete_existing_resource(resource_id)
            success = True  # Replace with actual implementation
            
            if not success:
                raise HTTPException(status_code=404, detail="Resource not found")
                
            return {
                "success": True,
                "message": "Resource deleted successfully"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting resource: {e}")
            raise HTTPException(status_code=500, detail=str(e)) 