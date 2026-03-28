"""Room schemas.

This module defines Pydantic schemas for room data validation and serialization.
"""

from pydantic import BaseModel
from app.schemas.reservation import ReservationResponse


class RoomBase(BaseModel):
    building: str
    room_num: int
    capacity: int
    features: list[str] | None = None


class RoomCreate(RoomBase):
    pass


# Schema for updating a room (all fields optional)
class RoomUpdate(BaseModel):
    building: str | None = None
    room_num: int | None = None
    capacity: int | None = None
    features: list[str] | None = None


class RoomResponse(RoomBase):
    id: int
    reservations: list[ReservationResponse] = []

    class ConfigDict:
        from_attributes = True
