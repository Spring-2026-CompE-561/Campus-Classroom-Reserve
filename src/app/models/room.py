from sqlalchemy import Column, Integer, String, JSON, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


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
    reservations = relationship("Reservation", back_populates="room")
    __table_args__ = (UniqueConstraint("building", "room_num"),)