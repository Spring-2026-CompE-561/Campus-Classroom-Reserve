from app.models.reservation import Reservation
from app.models.room import Room
from app.models.user import UserType
from app.repository.user import (
    UserRepository,
    UserCreate,
    User,
)
from sqlalchemy.orm import Session
from app.core.database import get_test_db, Base, test_engine

from datetime import datetime
import pytest

from app.schemas.user import UserUpdate


class TestUsers:
    db: Session

    @pytest.fixture(autouse=True)
    def test_framing(self):
        """Run this code before and after each test."""
        Base.metadata.create_all(bind=test_engine)
        self.db = get_test_db().send(None)
        self.db.query(User).delete(synchronize_session="fetch")
        self.db.query(Room).delete(synchronize_session="fetch")
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.commit()
        if len(self.db.query(Room).all()) == 0:
            self.db.add(Room(building="DEBUG", room_num=0, capacity=0, features=[]))
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
        self.db.commit()

        yield

        self.db.query(User).delete(synchronize_session="fetch")
        self.db.query(Room).delete(synchronize_session="fetch")
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.commit()

    @pytest.mark.skip(reason="This is a helper function.")
    def create_debug_data(self):
        to_create = UserCreate(
            name="Student Name",
            email="first@first.com",
            user_type=UserType.student,
            disabled=False,
            password="1234",
        )

        UserRepository.create(self.db, to_create, "1234")

        to_create = UserCreate(
            name="Faculty Name",
            email="second@second.com",
            user_type=UserType.faculty,
            disabled=False,
            password="1234",
        )

        UserRepository.create(self.db, to_create, "1234")

        to_create = UserCreate(
            name="Admin Name",
            email="third@third.com",
            user_type=UserType.admin,
            disabled=False,
            password="1234",
        )

        UserRepository.create(self.db, to_create, "1234")

    def test_create(self):
        """Test the creation function."""
        self.create_debug_data()
        all_users = self.db.query(User).all()
        assert len(all_users) == 3
        assert all_users[0].name == "Student Name"
        assert all_users[0].email == "first@first.com"
        assert not all_users[0].disabled

    def test_delete(self):
        """Test the delete function."""
        self.create_debug_data()
        all_users = self.db.query(User).all()
        assert len(all_users) == 3

        UserRepository.delete(self.db, all_users[0])
        all_users = self.db.query(User).all()
        assert len(all_users) == 2

    def test_get_all(self):
        """Test the get all function."""
        self.create_debug_data()
        all_users = self.db.query(User).all()
        assert len(all_users) == 3

        get_all = UserRepository.get_all(self.db)
        assert all_users == get_all

    def test_get_by_id(self):
        """Test the get by ID function."""
        self.create_debug_data()
        all_users = self.db.query(User).all()
        assert len(all_users) == 3

        user_1 = UserRepository.get_by_id(self.db, 1)
        assert all_users[0] == user_1

    def test_update(self):
        """Test the update function."""
        self.create_debug_data()
        user = UserRepository.get_by_id(self.db, 1)
        assert user is not None

        updated = UserUpdate(
            name="new name",
            email="new@new.com",
            user_type=UserType.admin,
            disabled=True,
        )

        user_response = UserRepository.update(self.db, user_id=1, user=updated)
        all_users = self.db.query(User).all()

        assert all_users[0] == user_response == user
        assert all_users[0].name == "new name"
        assert all_users[0].email == "new@new.com"
        assert all_users[0].user_type == UserType.admin
        assert all_users[0].disabled
