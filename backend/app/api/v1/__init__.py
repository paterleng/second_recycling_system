from fastapi import APIRouter
from .inspections import router as inspections_router

router = APIRouter()

router.include_router(inspections_router, prefix="/inspections", tags=["inspections"])