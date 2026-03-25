import enum
from typing import List

from sqlalchemy import Column, Integer, String, Enum, Boolean
from sqlalchemy.orm import Mapped, relationship

from app.core.database import Base
from app.models.reservation import Reservation


class UserType(enum.Enum):
    student = "Student"
    faculty = "Faculty"
    admin = "Admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    user_type = Column(Enum(UserType), nullable=False)
    disabled = Column(Boolean, nullable=False, default=False)

    reservations: Mapped[List["Reservation"]] = relationship(backref="user")
