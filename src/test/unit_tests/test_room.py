from datetime import datetime

from app.models.reservation import Reservation
from app.models.user import User, UserType
from app.repository.room import (
    RoomRepository,
    RoomCreate,
    Room,
)
from sqlalchemy.orm import Session
from app.core.database import get_test_db, Base, test_engine

import pytest

from app.schemas.room import RoomUpdate


class TestRooms:
    db: Session

    @pytest.fixture(autouse=True)
    def test_framing(self):
        """Run this code before and after each test."""
        Base.metadata.create_all(bind=test_engine)
        self.db = get_test_db().send(None)
        self.db = get_test_db().send(None)
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.commit()
        if len(self.db.query(Reservation).all()) == 0:
            self.db.add(
                Reservation(
                    room_id=0,
                    user_id=0,
                    start_time=datetime.now(),
                    end_time=datetime.now(),
                    purpose="DEBUG",
                )
            )
        if len(self.db.query(User).all()) == 0:
            self.db.add(
                User(
                    email="debug@debug.com",
                    hashed_password="1234",
                    name="Debug McDebuginson",
                    user_type=UserType.admin,
                    disabled=True,
                )
            )
        self.db.commit()

        yield

        self.db.query(Room).delete(synchronize_session="fetch")
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.query(User).delete(synchronize_session="fetch")

        self.db.commit()

    @pytest.mark.skip(reason="This is a helper function.")
    def create_debug_data(self):
        to_create = RoomCreate(
            building="HT", room_num=415, capacity=26, features=["computer", "projector"]
        )

        RoomRepository.create(self.db, to_create)

        to_create_2 = RoomCreate(
            building="PSFA",
            room_num=316,
            capacity=72,
            features=["computer", "projector", "recording"],
        )

        RoomRepository.create(self.db, to_create_2)

    def test_create(self):
        """Test the creation function."""
        self.create_debug_data()
        all_rooms = self.db.query(Room).all()
        assert len(all_rooms) == 2
        assert all_rooms[0].id == 1
        assert all_rooms[0].building == "HT"
        assert all_rooms[0].room_num == 415
        assert all_rooms[0].features == ["computer", "projector"]

    def test_delete(self):
        """Test the delete function."""
        self.create_debug_data()
        all_rooms = self.db.query(Room).all()
        assert len(all_rooms) == 2

        RoomRepository.delete(self.db, all_rooms[0])
        all_rooms = self.db.query(Room).all()
        assert len(all_rooms) == 1

    def test_get_all(self):
        """Test the get all function."""
        self.create_debug_data()
        all_rooms = self.db.query(Room).all()
        assert len(all_rooms) == 2

        get_all = RoomRepository.get_all(self.db)
        assert all_rooms == get_all

    def test_get_by_id(self):
        """Test the get by ID function."""
        self.create_debug_data()
        all_rooms = self.db.query(Room).all()
        assert len(all_rooms) == 2

        reservation_1 = RoomRepository.get_by_id(self.db, 1)
        assert all_rooms[0] == reservation_1

    def test_update(self):
        """Test the update function."""
        self.create_debug_data()
        all_rooms = self.db.query(Room).all()
        assert len(all_rooms) == 2

        room = RoomRepository.get_by_id(self.db, 1)
        assert room is not None

        new_room = RoomUpdate(features=["No more Features"])

        room_response = RoomRepository.update(self.db, room_id=1, room=new_room)
        all_rooms = self.db.query(Room).all()

        assert all_rooms[0] == room_response == room
