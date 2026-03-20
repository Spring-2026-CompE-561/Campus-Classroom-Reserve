from sqlalchemy import Column, Integer, String, DateTime

from app.core.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(String, nullable=True)

    user_id = Column(Integer, nullable=False)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, nullable=False)
    # room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
