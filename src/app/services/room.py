"""Room service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repository.room import RoomRepository
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate


ROOM_NOT_FOUND_MSG = "Room not found."


def get_rooms(db: Session) -> list[RoomResponse]:
    """Get all rooms."""
    rooms = RoomRepository.get_all(db)
    return [RoomResponse.model_validate(room) for room in rooms]


def get_room_by_id(db: Session, room_id: int) -> RoomResponse:
    """Get a specific room by ID."""
    room = RoomRepository.get_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG)
    return RoomResponse.model_validate(room)


def create_room(db: Session, room_data: RoomCreate) -> RoomResponse:
    """Create a new room."""
    room = RoomRepository.create(db, room_data)
    return RoomResponse.model_validate(room)


def update_room(db: Session, room_id: int, room_data: RoomUpdate) -> RoomResponse:
    """Update a room."""
    room = RoomRepository.update(db, room_id, room_data)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG)
    return RoomResponse.model_validate(room)


def delete_room(db: Session, room_id: int) -> RoomResponse:
    """Delete a room."""
    room = RoomRepository.get_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG)
    deleted = RoomRepository.delete(db, room)
    return RoomResponse.model_validate(deleted)
