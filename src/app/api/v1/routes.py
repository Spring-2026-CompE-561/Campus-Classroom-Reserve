from fastapi import APIRouter

from app.routes import category, transaction, user

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(category.api_router)
api_router.include_router(transaction.api_router)
api_router.include_router(user.api_router)
