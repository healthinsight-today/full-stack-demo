# MongoDB Context Implementation Guide

This document provides a step-by-step guide for implementing MongoDB context tracking in new FastAPI endpoints. Following these guidelines will ensure consistent context tracking across the entire API.

## Table of Contents

1. [Overview](#overview)
2. [Creating a Resource-Specific Context Manager](#creating-a-resource-specific-context-manager)
3. [Implementing Context-Aware Endpoints](#implementing-context-aware-endpoints)
4. [Examples](#examples)
5. [Troubleshooting](#troubleshooting)

## Overview

The MongoDB context system provides:

- Consistent tracking of all MongoDB operations
- Detailed analytics on API usage and performance
- Error tracking and logging
- Request context preservation
- User activity tracking

Every API endpoint should use this system to ensure comprehensive monitoring and analytics.

## Creating a Resource-Specific Context Manager

1. **Define a Resource-Specific Context Manager**

   Create a new context manager class that extends `BaseContextManager`:

   ```python
   from app.middleware.base_context import BaseContextManager, get_context_manager
   
   class MyResourceContextManager(BaseContextManager):
       """Context manager for my-resource operations"""
       RESOURCE_TYPE = "my-resource"
       
       async def get_resource(self, resource_id: str) -> Dict[str, Any]:
           """Get resource within MongoDB context"""
           return await self.with_context("get", resource_id)
       
       # Add other resource-specific methods here
   ```

2. **Create a Dependency Provider**

   Create a dependency provider function for your context manager:

   ```python
   get_my_resource_context = get_context_manager(MyResourceContextManager)
   ```

3. **Add Resource-Specific Methods**

   Add methods for all common operations on your resource:

   ```python
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
   ```

## Implementing Context-Aware Endpoints

1. **Import Dependencies**

   Import the necessary context-related dependencies in your route file:

   ```python
   from app.middleware.mongodb_context import mongodb_request_context
   from app.middleware.my_resource_context import get_my_resource_context, MyResourceContextManager
   ```

2. **Add Context Manager to Endpoint Dependencies**

   Add the context manager as a dependency to your endpoint function:

   ```python
   @router.get("/{resource_id}")
   async def get_resource(
       request: Request,
       resource_id: str,
       my_resource_context: MyResourceContextManager = Depends(get_my_resource_context)
   ):
       # ...
   ```

3. **Use the Context Manager in Your Endpoint**

   Use the `mongodb_request_context` context manager to wrap your endpoint logic:

   ```python
   async with mongodb_request_context(request, "my-resource", "get", resource_id) as context:
       try:
           # Call context manager method
           await my_resource_context.get_resource(resource_id)
           
           # Actual resource retrieval logic
           # ...
           
           return {"success": True, "data": resource}
       except Exception as e:
           logger.error(f"Error getting resource: {e}")
           raise HTTPException(status_code=500, detail=str(e))
   ```

## Examples

### Example 1: List Endpoint

```python
@router.get("", response_model=Dict[str, Any])
async def list_resources(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """List resources with pagination"""
    filters = {"page": page, "per_page": per_page}
    
    async with mongodb_request_context(request, "resource", "list") as context:
        try:
            # Track operation
            await resource_context.list_resources(filters)
            
            # Actual implementation
            resources = await get_resources(page, per_page)
            
            return {"success": True, "data": resources}
        except Exception as e:
            logger.error(f"Error listing resources: {e}")
            raise HTTPException(status_code=500, detail=str(e))
```

### Example 2: Create Endpoint

```python
@router.post("", response_model=Dict[str, Any])
async def create_resource(
    request: Request,
    resource_data: ResourceCreate,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    resource_context: ResourceContextManager = Depends(get_resource_context)
):
    """Create a new resource"""
    async with mongodb_request_context(request, "resource", "create") as context:
        try:
            # Track operation
            data_dict = resource_data.dict()
            await resource_context.create_resource(data_dict)
            
            # Add user ID
            data_dict["user_id"] = str(current_user["_id"])
            
            # Actual implementation
            new_resource = await insert_resource(data_dict)
            
            return {"success": True, "data": new_resource}
        except Exception as e:
            logger.error(f"Error creating resource: {e}")
            raise HTTPException(status_code=500, detail=str(e))
```

## Troubleshooting

### Common Issues

1. **Context Not Defined**

   Make sure to use the variable name from the `async with` statement:

   ```python
   async with mongodb_request_context(...) as context:
       # Use 'context' here
   ```

2. **Missing Context Details**

   Ensure you're passing the right parameters to the context managers:

   ```python
   # Wrong
   await resource_context.update_resource(resource_id)
   
   # Right
   await resource_context.update_resource(resource_id, resource_data)
   ```

3. **Context Manager Not Working**

   Check that your context manager class properly extends `BaseContextManager`:

   ```python
   class MyResourceContextManager(BaseContextManager):
       RESOURCE_TYPE = "my-resource"  # Must define this
   ```

4. **Operations Not Being Tracked**

   Make sure you're calling the context manager method inside the `mongodb_request_context`:

   ```python
   async with mongodb_request_context(...) as context:
       await resource_context.operation_method(...)  # Must be inside
   ```

### Best Practices

1. **Use Consistent Resource Types**: Use the same resource type string in both the context manager class and the `mongodb_request_context` call.

2. **Capture All Parameters**: Make sure to include all relevant parameters in the `details` dictionary.

3. **Handle Errors Properly**: Always catch exceptions and log them properly, but re-raise them as HTTPExceptions.

4. **Include User Context**: When available, always include the user ID in the context.

5. **Use Meaningful Operation Names**: Use consistent operation names like "get", "list", "create", "update", "delete", etc.

## Further Reading

- See the [README.md](./README.md) for an overview of the MongoDB context system
- Check the [endpoint_template.py](./endpoint_template.py) file for complete examples
- Review existing implementations in the `app/routes` directory 