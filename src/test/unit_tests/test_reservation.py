from app.models.room import Room
from app.models.user import User, UserType
from app.repository.reservation import (
    ReservationRepository,
    ReservationCreate,
    Reservation,
)
from sqlalchemy.orm import Session
from app.core.database import get_test_db, Base, test_engine

from datetime import datetime
import pytest


class TestReservations:
    db: Session

    @pytest.fixture(autouse=True)
    def test_framing(self):
        """Run this code before and after each test."""
        Base.metadata.create_all(bind=test_engine)
        self.db = get_test_db().send(None)
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.commit()
        if len(self.db.query(Room).all()) == 0:
            self.db.add(Room(building="DEBUG", room_num=0, capacity=0, features=[]))
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

        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.query(Room).delete(synchronize_session="fetch")
        self.db.query(User).delete(synchronize_session="fetch")
        self.db.commit()

    @pytest.mark.skip(reason="This is a helper function.")
    def create_debug_data(self):
        to_create = ReservationCreate(
            room_id=42,
            user_id=1234,
            start_time=datetime.fromisoformat("2026-03-25 09:00:00"),
            end_time=datetime.fromisoformat("2026-03-25 11:00:00"),
            purpose="Testing!",
        )

        ReservationRepository.create(self.db, to_create)

        to_create_2 = ReservationCreate(
            room_id=27,
            user_id=36,
            start_time=datetime.fromisoformat("2026-03-25 09:00:00"),
            end_time=datetime.fromisoformat("2026-03-25 11:00:00"),
            purpose="Testing!",
        )

        ReservationRepository.create(self.db, to_create_2)

    def test_create(self):
        """Test the creation function."""
        self.create_debug_data()
        all_reservations = self.db.query(Reservation).all()
        assert len(all_reservations) == 2
        assert all_reservations[0].id == 1
        assert all_reservations[0].user_id == 1234
        assert all_reservations[0].room_id == 42

    def test_delete(self):
        """Test the delete function."""
        self.create_debug_data()
        all_reservations = self.db.query(Reservation).all()
        assert len(all_reservations) == 2

        ReservationRepository.delete(self.db, all_reservations[0])
        all_reservations = self.db.query(Reservation).all()
        assert len(all_reservations) == 1

    def test_get_all(self):
        """Test the get all function."""
        self.create_debug_data()
        all_reservations = self.db.query(Reservation).all()
        assert len(all_reservations) == 2

        get_all = ReservationRepository.get_all(self.db)
        assert all_reservations == get_all

    def test_get_by_id(self):
        """Test the get by ID function."""
        self.create_debug_data()
        all_reservations = self.db.query(Reservation).all()
        assert len(all_reservations) == 2

        reservation_1 = ReservationRepository.get_by_id(self.db, 1)
        assert all_reservations[0] == reservation_1

    def test_update(self):
        """Test the update function."""
        self.create_debug_data()
        reservation = ReservationRepository.get_by_id(self.db, 1)
        assert reservation is not None

        start_time = datetime.fromisoformat("2026-03-25 12:00:00")
        end_time = datetime.fromisoformat("2026-03-25 14:00:00")
        purpose = "Updating!"
        reservation.start_time = start_time
        reservation.end_time = end_time
        reservation.purpose = purpose

        reservation_response = ReservationRepository.update(
            self.db, reservation_id=1, reservation=reservation
        )
        all_reservations = self.db.query(Reservation).all()

        assert all_reservations[0] == reservation_response == reservation
