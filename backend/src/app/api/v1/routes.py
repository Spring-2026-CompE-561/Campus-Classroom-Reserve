from fastapi import APIRouter

from app.routes import reservation, room, user

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(room.api_router)
api_router.include_router(reservation.api_router)
api_router.include_router(user.api_router)
