"""
API routes for Health Insight Today
"""

from fastapi import APIRouter

from app.config import settings

# Create main router with prefix
api_router = APIRouter(prefix=settings.API_PREFIX)

# Import route modules
from .health_check import router as health_check_router
from .health_analysis import router as health_analysis_router
from .documents import router as documents_router
from .providers import router as providers_router
from .nutrition import router as nutrition_router
from .dashboard import router as dashboard_router
# Import new route modules
from .diet import router as diet_router
from .shopping import router as shopping_router
from .specialists import router as specialists_router
# Import auth router
from .auth import router as auth_router

# Register health check route at root level
api_router.include_router(health_check_router)

# Register routes with prefixes and tags
api_router.include_router(
    health_analysis_router,
    prefix="/health",
    tags=["Health Analysis"]
)

api_router.include_router(
    documents_router,
    prefix="/documents",
    tags=["Documents"]
)

api_router.include_router(
    providers_router,
    prefix="/providers",
    tags=["Healthcare Providers"]
)

api_router.include_router(
    nutrition_router,
    prefix="/nutrition",
    tags=["Nutrition"]
)

api_router.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# Register new routes
api_router.include_router(
    diet_router,
    tags=["Diet"]
)

api_router.include_router(
    shopping_router,
    tags=["Shopping"]
)

api_router.include_router(
    specialists_router,
    tags=["Specialists"]
)

# Register auth routes
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
) 