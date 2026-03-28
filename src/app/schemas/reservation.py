"""Reservation schemas.

This module defines Pydantic schemas for reservation data validation and serialization.
"""

from datetime import datetime
from pydantic import BaseModel

MAX_DESCRIPTION_LENGTH = 255


class ReservationUpdate(BaseModel):
    start_time: datetime | None
    end_time: datetime | None
    purpose: str | None


class ReservationBase(BaseModel):
    room_id: int
    user_id: int | None = None
    start_time: datetime
    end_time: datetime
    purpose: str | None

class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    id: int

    class ConfigDict:
        from_attributes = True
