"""Room service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.repository.room import RoomRepository
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate


ROOM_NOT_FOUND_MSG = "Room not found."


def get_rooms(db: Session) -> list[RoomResponse]:
    """Get all rooms."""
    rooms = RoomRepository.get_all(db)
    return [
        RoomResponse(
            id=room.id,
            building=room.building,
            room_num=room.room_num,
            capacity=room.capacity,
            features=room.features,
        )
        for room in rooms
    ]


def get_room_by_id(db: Session, room_id: int) -> RoomResponse:
    """Get a specific room by ID."""
    room = RoomRepository.get_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG)
    return RoomResponse(
        id=room.id,
        building=room.building,
        room_num=room.room_num,
        capacity=room.capacity,
        features=room.features,
    )


def create_room(db: Session, room_data: RoomCreate) -> RoomResponse:
    """Create a new room."""
    try:
        room = RoomRepository.create(db, room_data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A room with that building and room number already exists."
        )
    return RoomResponse(
        id=room.id,
        building=room.building,
        room_num=room.room_num,
        capacity=room.capacity,
        features=room.features,
    )


def update_room(db: Session, room_id: int, room_data: RoomUpdate) -> RoomResponse:
    """Update a room."""
    room = RoomRepository.update(db, room_id, room_data)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG)
    return RoomResponse(
        id=room.id,
        building=room.building,
        room_num=room.room_num,
        capacity=room.capacity,
        features=room.features,
    )


def delete_room(db: Session, room_id: int) -> RoomResponse:
    """Delete a room."""
    room = RoomRepository.get_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG)
    deleted = RoomRepository.delete(db, room)
    return RoomResponse(
        id=deleted.id,
        building=deleted.building,
        room_num=deleted.room_num,
        capacity=deleted.capacity,
        features=deleted.features,
    )
