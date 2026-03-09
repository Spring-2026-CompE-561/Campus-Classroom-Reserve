"""Reservation schemas.

This module defines Pydantic schemas for reservation data validation and serialization.
"""
from datetime import datetime
from pydantic import BaseModel

MAX_DESCRIPTION_LENGTH = 255


class ReservationBase(BaseModel):
    room_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    purpose: str | None


class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    pass

    class Config:
        from_attributes = True
