import enum
from typing import List

from sqlalchemy import Column, Integer, String, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.reservation import Reservation


class UserType(enum.Enum):
    student = "Student"
    faculty = "Faculty"
    admin = "Admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    user_type: Mapped[UserType] = mapped_column(Enum(UserType), nullable=False)
    disabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    reservations: Mapped[List["Reservation"]] = relationship(backref="user")
