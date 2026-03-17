from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import app.services.reservation as reservation_services
from app.schemas.reservation import ReservationResponse, ReservationCreate

# from app.core.auth import oauth2_scheme
from app.core.database import get_db

api_router = APIRouter(prefix="/reservations", tags=["reservations"])


@api_router.post("/")
async def create_reservation(
    reservation: ReservationCreate,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> ReservationResponse:
    """Create a Reservation."""
    # TODO: NYI
    return reservation_services.create_reservation(db, reservation=reservation)


@api_router.get("/")
async def get_reservations(
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Get Reservation List."""
    # TODO: NYI
    return reservation_services.get_reservations(db)


@api_router.get("/{reservation_id}")
async def get_reservation_by_id(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Get specific reservation."""
    # TODO: NYI
    return reservation_services.get_reservation_by_id(db, reservation_id)


@api_router.put("/{reservation_id}")
async def update_reservation(
    reservation_id: int,
    start_time: datetime | None,
    end_time: datetime | None,
    purpose: str,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Delete Reservation by ID."""
    # TODO: NYI
    new_reservation = ReservationCreate(
        start_time=start_time, end_time=end_time, purpose=purpose
    )
    return reservation_services.update_reservation(db, reservation_id, new_reservation)


@api_router.delete("/{reservation_id}")
async def delete_reservation(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Delete Reservation by ID."""
    # TODO: NYI
    return reservation_services.delete_reservation(db, reservation_id)
