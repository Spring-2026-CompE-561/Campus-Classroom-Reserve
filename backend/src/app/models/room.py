from sqlalchemy import Column, Integer, String, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from typing import List
from app.models.reservation import Reservation


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    building: Mapped[str] = mapped_column(String, nullable=False)
    room_num: Mapped[int] = mapped_column(Integer, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    features: Mapped[list] = mapped_column(JSON, nullable=True)
    """ NOTE: Features are stored as a JSON list for simplicity.
        A more robust relational approach would be a separate
        room_features table with a foreign key to rooms.
    """
    reservations: Mapped[List["Reservation"]] = relationship(backref="room")

    __table_args__ = (
        UniqueConstraint("building", "room_num", name="uq_building_room_num"),
    )
