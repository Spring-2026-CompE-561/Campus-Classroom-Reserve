"""Room repository."""

from datetime import datetime

from sqlalchemy import String, cast, func, select
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
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
    def get_distinct_buildings(db: Session) -> list[str]:
        """Get all distinct building codes ordered alphabetically."""
        result = db.query(Room.building).distinct().order_by(Room.building).all()
        return [r[0] for r in result]

    @staticmethod
    def get_filtered_paginated(
        db: Session,
        page: int = 1,
        page_size: int = 25,
        building: str | None = None,
        search: str | None = None,
        min_capacity: int | None = None,
        features: list[str] | None = None,
        avail_from: datetime | None = None,
        avail_to: datetime | None = None,
    ) -> tuple[list[Room], int]:
        """Return (rooms, total) applying server-side filters and pagination."""
        query = db.query(Room)

        if building:
            query = query.filter(Room.building == building)

        if min_capacity is not None:
            query = query.filter(Room.capacity >= min_capacity)

        if search:
            term = f"%{search.lower()}%"
            query = query.filter(
                func.lower(Room.building).like(term)
                | func.lower(cast(Room.room_num, String)).like(term)
                | func.lower(cast(Room.features, String)).like(term)
            )

        if features:
            for feature in features:
                # Match exact feature key inside the JSON array string
                query = query.filter(cast(Room.features, String).like(f'%"{feature}"%'))

        if avail_from and avail_to:
            # Strip tz info so comparison works against naive DB datetimes
            from_dt = avail_from.replace(tzinfo=None)
            to_dt = avail_to.replace(tzinfo=None)
            conflict = select(Reservation.id).where(
                Reservation.room_id == Room.id,
                Reservation.start_time < to_dt,
                Reservation.end_time > from_dt,
            )
            query = query.filter(~conflict.exists())

        total = query.count()
        rooms = (
            query.order_by(Room.building, Room.room_num)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return rooms, total

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
