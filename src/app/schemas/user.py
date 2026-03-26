"""User schemas.

This module defines Pydantic schemas for user data validation and serialization.
"""

from pydantic import BaseModel, EmailStr

from app.models.user import UserType
from app.schemas.reservation import ReservationResponse


class UserBase(BaseModel):
    """Base user schema."""

    name: str
    email: EmailStr
    user_type: UserType
    disabled: bool = False


class UserCreate(UserBase):
    """Schema for creating a new user (signup)."""

    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user (all fields optional)."""

    name: str | None = None
    email: EmailStr | None = None
    user_type: UserType | None = None
    disabled: bool | None = None


class UserResponse(UserBase):
    """Schema for user responses (never exposes the password)."""

    id: int
    reservations: list[ReservationResponse] = []

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for data encoded inside a JWT."""

    email: str | None = None
