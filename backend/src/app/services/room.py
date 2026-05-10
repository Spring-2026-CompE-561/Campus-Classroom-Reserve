"""Room service."""

from datetime import datetime
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.repository.room import RoomRepository
from app.schemas.room import PaginatedRoomResponse, RoomCreate, RoomResponse, RoomUpdate


ROOM_NOT_FOUND_MSG = "Room not found."


def _to_response(room) -> RoomResponse:  # type: ignore[no-untyped-def]
    return RoomResponse(
        id=room.id,
        building=room.building,
        room_num=room.room_num,
        capacity=room.capacity,
        features=room.features,
    )


def get_buildings(db: Session) -> list[str]:
    """Get all distinct building codes."""
    return RoomRepository.get_distinct_buildings(db)


def get_rooms_paginated(
    db: Session,
    page: int = 1,
    page_size: int = 25,
    building: str | None = None,
    search: str | None = None,
    min_capacity: int | None = None,
    features: list[str] | None = None,
    avail_from: datetime | None = None,
    avail_to: datetime | None = None,
) -> PaginatedRoomResponse:
    """Get rooms with server-side filtering and pagination."""
    rooms, total = RoomRepository.get_filtered_paginated(
        db,
        page=page,
        page_size=page_size,
        building=building,
        search=search,
        min_capacity=min_capacity,
        features=features or [],
        avail_from=avail_from,
        avail_to=avail_to,
    )
    total_pages = max(1, ceil(total / page_size))
    return PaginatedRoomResponse(
        rooms=[_to_response(r) for r in rooms],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def get_rooms(db: Session) -> list[RoomResponse]:
    """Get all rooms (kept for internal use and existing tests)."""
    rooms = RoomRepository.get_all(db)
    return [_to_response(room) for room in rooms]  # type: ignore[union-attr]


def get_room_by_id(db: Session, room_id: int) -> RoomResponse:
    """Get a specific room by ID."""
    room = RoomRepository.get_by_id(db, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG
        )
    return _to_response(room)


def create_room(db: Session, room_data: RoomCreate) -> RoomResponse:
    """Create a new room."""
    building = RoomRepository.get_by_building(db, room_data.building)
    if building is not None:
        for room in building:
            if room.room_num == room_data.room_num:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A room with that building and room number already exists.",
                )

    try:
        room = RoomRepository.create(db, room_data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A room with that building and room number already exists.",
        )
    return _to_response(room)


def update_room(db: Session, room_id: int, room_data: RoomUpdate) -> RoomResponse:
    """Update a room."""
    room = RoomRepository.update(db, room_id, room_data)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG
        )
    return _to_response(room)


def delete_room(db: Session, room_id: int) -> RoomResponse:
    """Delete a room."""
    room = RoomRepository.get_by_id(db, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=ROOM_NOT_FOUND_MSG
        )
    deleted = RoomRepository.delete(db, room)
    return _to_response(deleted if deleted is not None else room)
