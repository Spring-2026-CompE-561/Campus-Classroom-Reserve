from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import app.services.reservation as reservation_services
from app.schemas.reservation import (
    ReservationResponse,
    ReservationCreate,
    ReservationUpdate,
)

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import UserType

api_router = APIRouter(prefix="/reservations", tags=["reservations"])


@api_router.post("/")
async def create_reservation(
    reservation: ReservationCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_user),
) -> ReservationResponse:
    """Create a Reservation."""
    reservation.user_id = current_user.id
    return reservation_services.create_reservation(db, reservation=reservation)


@api_router.get("/")
async def get_reservations(
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_user),
) -> list[ReservationResponse]:
    """Get Reservation List."""
    if current_user.user_type == UserType.admin:
        return reservation_services.get_reservations(db)
    return reservation_services.get_reservations_by_user(db, current_user.id)


@api_router.get("/{reservation_id}")
async def get_reservation_by_id(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_user),
) -> ReservationResponse:
    """Get specific reservation."""
    return reservation_services.get_reservation_by_id(db, reservation_id)


@api_router.put("/{reservation_id}")
async def update_reservation(
    db: Annotated[Session, Depends(get_db)],
    reservation_id: int,
    current_user=Depends(get_current_user),
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    purpose: str | None = None,
) -> ReservationResponse:
    """Update Reservation by ID."""
    new_reservation = ReservationUpdate(
        id=reservation_id, start_time=start_time, end_time=end_time, purpose=purpose
    )
    return reservation_services.update_reservation(db, reservation_id, new_reservation)


@api_router.delete("/{reservation_id}")
async def delete_reservation(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_user),
) -> ReservationResponse:
    """Delete Reservation by ID."""
    return reservation_services.delete_reservation(db, reservation_id)
