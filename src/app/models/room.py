from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String)
    capacity = Column(Integer)
    features = Column(String) #TODO: Make this a list

    reservations = relationship("Reservation", back_populates="room")
