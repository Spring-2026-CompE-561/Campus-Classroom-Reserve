from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String, nullable=False)
    room_num = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    features = Column(JSON, nullable=True)

    reservations = relationship("Reservation", back_populates="room")
