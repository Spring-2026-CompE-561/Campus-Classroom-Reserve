from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import app.services.reservation as reservation_services
from app.schemas.reservation import ReservationResponse, ReservationCreate
from app.core.auth import oauth2_scheme
from app.core.database import get_db

api_router = APIRouter(prefix="/reservations", tags=["reservations"])


@api_router.post("/")
async def create_reservation(
    reservation: ReservationCreate,
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> ReservationResponse:
    """Create a Reservation."""
    # TODO: NYI
    return ReservationResponse()
    # user = get_current_user(token, db)
    # return reservation_service.create_reservation(
    #     db, transaction, user.id)


@api_router.get("/")
async def get_reservations(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Get Reservation List."""
    # TODO: NYI
    # return ReservationResponse()
    # user = get_current_user(token, db)
    return reservation_services.get_reservations(db)


@api_router.get("/{reservation_id}")
async def get_reservation_by_id(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Get specific reservation."""
    # TODO: NYI
    # user = get_current_user(token, db)
    return reservation_services.get_reservation_by_id(db, reservation_id)


@api_router.put("/{reservation_id}")
async def delete_reservation(
    reservation_id: int,
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> list[ReservationResponse]:
    """Delete Reservation by ID."""
    # TODO: NYI
    return reservation_services.delete_reservation(db, reservation_id)
