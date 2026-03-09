from fastapi import APIRouter

api_router = APIRouter(prefix="/room", tags=["rooms"])


@api_router.get("/")
async def read_rooms() -> dict:
    return {"message": "List of rooms"}
