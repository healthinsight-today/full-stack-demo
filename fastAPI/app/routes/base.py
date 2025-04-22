from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os

router = APIRouter(tags=["general"])

# Get the templates directory path
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
templates = Jinja2Templates(directory=os.path.join(base_dir, "app", "templates"))

@router.get("/")
async def root():
    """
    Root endpoint with welcome message.
    """
    return {"message": "Welcome to Health Insight Today API"}

@router.get("/ocr-test", response_class=HTMLResponse)
async def ocr_test_form(request: Request):
    """
    Serve the OCR testing form.
    """
    return templates.TemplateResponse("ocr_form.html", {"request": request}) 