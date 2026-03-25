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

        yield

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
