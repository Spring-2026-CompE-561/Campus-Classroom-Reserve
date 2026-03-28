from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate
from app.services import room as room_service

api_router = APIRouter(prefix="/rooms", tags=["rooms"])


@api_router.get("/", response_model=list[RoomResponse])
async def read_rooms(db: Session = Depends(get_db)) -> list[RoomResponse]:
    return room_service.get_rooms(db)


@api_router.get("/{room_id}", response_model=RoomResponse)
async def read_room(room_id: int, db: Session = Depends(get_db)) -> RoomResponse:
    return room_service.get_room_by_id(db, room_id)


@api_router.post("/", response_model=RoomResponse, status_code=201)
async def create_room(room_data: RoomCreate, db: Session = Depends(get_db)) -> RoomResponse:
    return room_service.create_room(db, room_data)


@api_router.put("/{room_id}", response_model=RoomResponse)
async def replace_room(room_id: int, room_data: RoomCreate, db: Session = Depends(get_db)) -> RoomResponse:
    return room_service.update_room(db, room_id, room_data)


@api_router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(room_id: int, room_data: RoomUpdate, db: Session = Depends(get_db)) -> RoomResponse:
    return room_service.update_room(db, room_id, room_data)


@api_router.delete("/{room_id}", response_model=RoomResponse)
async def delete_room(room_id: int, db: Session = Depends(get_db)) -> RoomResponse:
    return room_service.delete_room(db, room_id)
