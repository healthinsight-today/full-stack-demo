# MongoDB Context Middleware

This directory contains the MongoDB context middleware implementation for the Health Insight Today API. The middleware provides automatic context tracking for all API requests, enabling detailed analytics and monitoring.

## Components

### 1. `mongodb_context.py`

Core async context manager that tracks MongoDB operations with detailed context information:

- Wraps MongoDB operations with context tracking
- Records operation type, resource type, resource ID, and timing information
- Logs success/failure status and duration
- Automatically records analytics in MongoDB

Usage:
```python
async with mongodb_request_context(request, "parameter", "get", parameter_id) as context:
    # Your operation code here
    parameter = await get_parameter_by_id(parameter_id)
    # Context contains all tracking information
```

### 2. `base_context.py`

Provides a base context manager class that can be extended for different resource types:

- `BaseContextManager`: Abstract base class for context managers
- Resource-specific implementations for different domains (health, documents, auth, etc.)
- Factory function to create dependency providers

Usage:
```python
# Create a context manager for a specific resource type
class ReportContextManager(BaseContextManager):
    RESOURCE_TYPE = "report"

# Create a dependency provider
get_report_context = get_context_manager(ReportContextManager)

# Use in FastAPI endpoint
@router.get("/reports/{report_id}")
async def get_report(
    report_id: str,
    report_context: ReportContextManager = Depends(get_report_context)
):
    # Use context manager
    return await report_context.with_context("get", report_id)
```

### 3. `parameter_context.py`

Specific implementation for parameter operations:

- Extends the base context manager pattern for parameter-related operations
- Provides specialized methods for common parameter operations
- Records detailed parameter operation analytics

### 4. `context_middleware.py`

Global middleware that automatically adds context tracking to all API requests:

- Added to the FastAPI application via `setup_context_middleware(app)`
- Records basic request information for all endpoints
- Attaches context to request state for access in route handlers
- Records request duration and status code

## Integration Points

The context middleware integrates with:

1. **MongoDB client**: Uses the MongoDB client to record analytics and operation logs
2. **FastAPI application**: Attached as middleware to intercept all requests
3. **Route handlers**: Provides context managers as dependencies for endpoints
4. **Logging system**: Logs operation details for debugging and monitoring

## How to Use

### For Endpoints

1. Import the appropriate context manager:
```python
from app.services.parameter_context import get_parameter_context, ParameterContextManager
```

2. Add it as a dependency to your endpoint:
```python
@router.get("/{parameter_id}")
async def get_parameter(
    parameter_id: str,
    param_context: ParameterContextManager = Depends(get_parameter_context)
):
    # Use context manager
    async with mongodb_request_context(request, "parameter", "get", parameter_id) as context:
        # Your operation code
```

### For New Resource Types

1. Create a new context manager by extending `BaseContextManager`:
```python
from app.middleware.base_context import BaseContextManager, get_context_manager

class NewResourceContextManager(BaseContextManager):
    RESOURCE_TYPE = "new_resource"
    
    # Add resource-specific methods
    async def custom_operation(self, resource_id):
        return await self.with_context("custom", resource_id)

# Create dependency provider
get_new_resource_context = get_context_manager(NewResourceContextManager)
```

## Benefits

- **Consistent tracking**: All operations follow the same context tracking pattern
- **Detailed analytics**: Every operation is recorded with timing and context info
- **Error tracking**: Automatically captures and logs errors
- **Performance monitoring**: Track operation duration and identify bottlenecks
- **Audit trail**: Complete record of all operations for compliance and debugging 