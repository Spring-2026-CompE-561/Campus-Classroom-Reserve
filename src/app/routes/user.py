from fastapi import APIRouter

api_router = APIRouter(prefix="/user", tags=["users"])


@api_router.get("/login")
async def read_users() -> dict:
    return {"message": "List of users"}
