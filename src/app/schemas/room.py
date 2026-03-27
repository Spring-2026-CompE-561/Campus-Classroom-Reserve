"""Room schemas.

This module defines Pydantic schemas for room data validation and serialization.
"""
from pydantic import BaseModel


class RoomBase(BaseModel):
    building: str
    room_num: int
    capacity: int
    features: list[str] | None = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    building: str | None = None
    room_num: int | None = None
    capacity: int | None = None
    features: list[str] | None = None


class RoomResponse(RoomBase):
    id: int

    class Config:
        from_attributes = True
