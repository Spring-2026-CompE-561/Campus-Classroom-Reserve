from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User, UserType
from app.schemas.room import PaginatedRoomResponse, RoomCreate, RoomResponse, RoomUpdate
from app.services import room as room_service

api_router = APIRouter(prefix="/rooms", tags=["rooms"])


# /buildings must be defined before /{room_id} to avoid being caught by the dynamic route
@api_router.get("/buildings", response_model=list[str])
async def get_buildings(
    db: Session = Depends(get_db),
    #current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
) -> list[str]:
    """Get all distinct building codes. Accessible by any authenticated user."""
    return room_service.get_buildings(db)


@api_router.get("/", response_model=PaginatedRoomResponse)
async def read_rooms(
    db: Session = Depends(get_db),
    #current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    building: str | None = Query(default=None),
    search: str | None = Query(default=None),
    min_capacity: int | None = Query(default=None, ge=1),
    features: list[str] = Query(default=[]),
    avail_from: datetime | None = Query(default=None),
    avail_to: datetime | None = Query(default=None),
) -> PaginatedRoomResponse:
    """Get rooms with server-side filtering and pagination. Accessible by any authenticated user."""
    return room_service.get_rooms_paginated(
        db,
        page=page,
        page_size=page_size,
        building=building,
        search=search,
        min_capacity=min_capacity,
        features=features,
        avail_from=avail_from,
        avail_to=avail_to,
    )


@api_router.get("/{room_id}", response_model=RoomResponse)
async def read_room(
    room_id: int,
    db: Session = Depends(get_db),
    #current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
) -> RoomResponse:
    """Get a specific room by ID. Publicly accessible."""
    return room_service.get_room_by_id(db, room_id)


# Only admins can create, update, or delete rooms
@api_router.post("/", response_model=RoomResponse, status_code=201)
async def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
) -> RoomResponse:
    """Create a new room. Admin only."""
    if current_user is None or current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return room_service.create_room(db, room_data)


@api_router.put("/{room_id}", response_model=RoomResponse)
async def replace_room(
    room_id: int,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
) -> RoomResponse:
    """Replace a room's data entirely. Admin only."""
    if current_user is None or current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return room_service.update_room(db, room_id, room_data)


@api_router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
) -> RoomResponse:
    """Partially update a room's data. Admin only."""
    if current_user is None or current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return room_service.update_room(db, room_id, room_data)


@api_router.delete("/{room_id}", response_model=RoomResponse)
async def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,  # type: ignore
) -> RoomResponse:
    """Delete a room by ID. Admin only."""
    if current_user is None or current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return room_service.delete_room(db, room_id)
