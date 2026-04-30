"""Room repository."""

from sqlalchemy.orm import Session

from app.models.room import Room
from app.schemas.room import RoomCreate, RoomUpdate


class RoomRepository:
    """Room repository data access."""

    @staticmethod
    def get_all(db: Session) -> list[Room] | None:
        """Get all rooms in the system."""
        return db.query(Room).all()

    @staticmethod
    def get_by_id(db: Session, room_id: int) -> Room | None:
        """Get a specific room by ID."""
        return db.query(Room).filter(Room.id == room_id).first()

    @staticmethod
    def get_by_building(db: Session, building: str) -> list[Room] | None:
        """Get all rooms in a specific building."""
        return db.query(Room).filter(Room.building == building).all()

    @staticmethod
    def create(db: Session, room: RoomCreate) -> Room:
        """Create a new room."""
        db_room = Room(
            building=room.building,
            room_num=room.room_num,
            capacity=room.capacity,
            features=room.features,
        )
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room

    @staticmethod
    def update(db: Session, room_id: int, room: RoomUpdate) -> Room | None:
        """Update a room's information."""
        db_room = db.query(Room).filter(Room.id == room_id).first()
        if db_room is None:
            return None
        for key, value in room.model_dump(exclude_unset=True).items():
            setattr(db_room, key, value)
        db.commit()
        db.refresh(db_room)
        return db_room

    @staticmethod
    def delete(db: Session, room: Room | None) -> Room | None:
        """Delete a room."""
        if room is None:
            return None
        db.delete(room)
        db.commit()
        return room
