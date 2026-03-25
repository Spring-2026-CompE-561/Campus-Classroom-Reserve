from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse

api_router = APIRouter(prefix="/rooms", tags=["rooms"])


@api_router.get("/", response_model=list[RoomResponse])
async def read_rooms(db: Session = Depends(get_db)) -> list[Room]:
    return db.query(Room).all()


@api_router.get("/{room_id}", response_model=RoomResponse)
async def read_room(room_id: int, db: Session = Depends(get_db)) -> Room:
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@api_router.post("/", response_model=RoomResponse, status_code=201)
async def create_room(room_data: RoomCreate, db: Session = Depends(get_db)) -> Room:
    room = Room(
        building=room_data.building,
        room_num=room_data.room_num,
        capacity=room_data.capacity,
        features=",".join(room_data.features),
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@api_router.put("/{room_id}", response_model=RoomResponse)
async def replace_room(
    room_id: int, room_data: RoomCreate, db: Session = Depends(get_db)
) -> Room:
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    room.building = room_data.building
    room.room_num = room_data.room_num
    room.capacity = room_data.capacity
    room.features = ",".join(room_data.features)
    db.commit()
    db.refresh(room)
    return room


@api_router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int, room_data: RoomCreate, db: Session = Depends(get_db)
) -> Room:
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    if room_data.building is not None:
        room.building = room_data.building
    if room_data.room_num is not None:
        room.room_num = room_data.room_num
    if room_data.capacity is not None:
        room.capacity = room_data.capacity
    if room_data.features is not None:
        room.features = ",".join(room_data.features)
    db.commit()
    db.refresh(room)
    return room


@api_router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: int, db: Session = Depends(get_db)) -> None:
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
