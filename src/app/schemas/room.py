"""Room schemas.

This module defines Pydantic schemas for room data validation and serialization.
"""
from pydantic import BaseModel


class RoomBase(BaseModel):
    building: str
    room_num: int
    capacity: int
    features: list[str]
    #reservations: TODO


class RoomCreate(RoomBase):
    pass


class RoomResponse(RoomBase):
    id: int

    class Config:
        from_attributes = True
