from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User, UserType
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate
from app.services import room as room_service

api_router = APIRouter(prefix="/rooms", tags=["rooms"])


# Any logged in user can view rooms
@api_router.get("/", response_model=list[RoomResponse])
async def read_rooms(
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,
) -> list[RoomResponse]:
    """Get all rooms. Accessible by any authenticated user."""
    return room_service.get_rooms(db)


# Any logged in user can view a specific room
@api_router.get("/{room_id}", response_model=RoomResponse)
async def read_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,
) -> RoomResponse:
    """Get a specific room by ID. Accessible by any authenticated user."""
    return room_service.get_room_by_id(db, room_id)


# Only admins can create, update, or delete rooms
@api_router.post("/", response_model=RoomResponse, status_code=201)
async def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,
) -> RoomResponse:
    """Create a new room. Admin only."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized."
        )
    return room_service.create_room(db, room_data)


@api_router.put("/{room_id}", response_model=RoomResponse)
async def replace_room(
    room_id: int,
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,
) -> RoomResponse:
    """Replace a room's data entirely. Admin only."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized."
        )
    return room_service.update_room(db, room_id, room_data)


@api_router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,
) -> RoomResponse:
    """Partially update a room's data. Admin only."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized."
        )
    return room_service.update_room(db, room_id, room_data)


@api_router.delete("/{room_id}", response_model=RoomResponse)
async def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_user)] = None,
) -> RoomResponse:
    """Delete a room by ID. Admin only."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized."
        )
    return room_service.delete_room(db, room_id)