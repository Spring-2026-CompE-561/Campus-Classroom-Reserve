from fastapi import APIRouter

api_router = APIRouter(prefix="/reservations", tags=["reservations"])


@api_router.get("/")
async def read_reservations() -> dict:
    return {"message": "List of reservations"}
