from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import Mapped, relationship
from app.core.database import Base
from typing import List
from app.models.reservation import Reservation


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String, nullable=False)
    room_num = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    features = Column(JSON, nullable=True)
    """ NOTE: Features are stored as a JSON list for simplicity.
        A more robust relational approach would be a separate
        room_features table with a foreign key to rooms.
    """
    reservations: Mapped[List["Reservation"]] = relationship(backref="room")
