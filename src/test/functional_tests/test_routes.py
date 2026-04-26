"""Functional tests for all routes."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.database import Base, get_db, get_test_db, test_engine
from app.main import app
from app.models.room import Room
from app.models.user import User
from app.models.reservation import Reservation


# Override the database dependency to use the test database
def override_get_db():
    db = get_test_db().send(None)
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


class TestRoutes:
    db: Session

    @pytest.fixture(autouse=True)
    def test_framing(self):
        """Set up and tear down the test database before and after each test."""
        Base.metadata.create_all(bind=test_engine)
        self.db = get_test_db().send(None)

        # Clear tables
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.query(Room).delete(synchronize_session="fetch")
        self.db.query(User).delete(synchronize_session="fetch")
        self.db.commit()

        # Create a test room
        self.db.add(Room(building="ENG", room_num=101, capacity=30, features=[]))
        self.db.commit()

        yield

        # Teardown
        self.db.query(Reservation).delete(synchronize_session="fetch")
        self.db.query(Room).delete(synchronize_session="fetch")
        self.db.query(User).delete(synchronize_session="fetch")
        self.db.commit()

    def get_student_token(self):
        """Helper to register and login a student, returns token."""
        client.post(
            "/api/v1/user/signup",
            json={
                "name": "Test Student",
                "email": "student@test.com",
                "user_type": "Student",
                "disabled": False,
                "password": "testpass123",
            },
        )
        response = client.post(
            "/api/v1/user/login",
            data={"username": "student@test.com", "password": "testpass123"},
        )
        return response.json()["access_token"]

    def get_admin_token(self):
        """Helper to register and login an admin, returns token."""
        client.post(
            "/api/v1/user/signup",
            json={
                "name": "Test Admin",
                "email": "admin@test.com",
                "user_type": "Admin",
                "disabled": False,
                "password": "adminpass123",
            },
        )
        response = client.post(
            "/api/v1/user/login",
            data={"username": "admin@test.com", "password": "adminpass123"},
        )
        return response.json()["access_token"]

    # -------------------------
    # User endpoint tests
    # -------------------------

    def test_signup(self):
        """Anyone can sign up."""
        response = client.post(
            "/api/v1/user/signup",
            json={
                "name": "New User",
                "email": "new@test.com",
                "user_type": "Student",
                "disabled": False,
                "password": "password123",
            },
        )
        assert response.status_code == 200
        assert response.json()["email"] == "new@test.com"

    def test_login(self):
        """User can login and get a token."""
        token = self.get_student_token()
        assert token is not None

    def test_get_users_as_student_forbidden(self):
        """Students cannot get all users."""
        token = self.get_student_token()
        response = client.get(
            "/api/v1/user/", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403

    def test_get_users_as_admin(self):
        """Admins can get all users."""
        token = self.get_admin_token()
        response = client.get(
            "/api/v1/user/", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

    def test_get_users_unauthenticated(self):
        """Unauthenticated users cannot get all users."""
        response = client.get("/api/v1/user/")
        assert response.status_code == 401

    def test_get_user_by_id_own(self):
        """Students can get their own profile."""
        token = self.get_student_token()
        me = client.get("/api/v1/user/me", headers={"Authorization": f"Bearer {token}"})
        user_id = me.json()["id"]
        response = client.get(
            f"/api/v1/user/{user_id}", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

    def test_get_user_by_id_other_forbidden(self):
        """Students cannot get another user's profile."""
        student_token = self.get_student_token()
        admin_token = self.get_admin_token()
        admin = client.get(
            "/api/v1/user/me", headers={"Authorization": f"Bearer {admin_token}"}
        )
        admin_id = admin.json()["id"]
        response = client.get(
            f"/api/v1/user/{admin_id}",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert response.status_code == 403

    # -------------------------
    # Room endpoint tests
    # -------------------------

    def test_get_rooms_unauthenticated(self):
        """Unauthenticated users cannot get rooms."""
        response = client.get("/api/v1/rooms/")
        assert response.status_code == 401

    def test_get_rooms_as_student(self):
        """Students can get all rooms."""
        token = self.get_student_token()
        response = client.get(
            "/api/v1/rooms/", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

    def test_create_room_as_student_forbidden(self):
        """Students cannot create rooms."""
        token = self.get_student_token()
        response = client.post(
            "/api/v1/rooms/",
            json={"building": "CS", "room_num": 202, "capacity": 20, "features": []},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    def test_create_room_as_admin(self):
        """Admins can create rooms."""
        token = self.get_admin_token()
        response = client.post(
            "/api/v1/rooms/",
            json={"building": "CS", "room_num": 202, "capacity": 20, "features": []},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201

    @pytest.mark.skip(reason="Issue 36: Duplicate rooms does not raise HTTP Error 400")
    def test_create_duplicate_room(self):
        """Cannot create two rooms with the same building and room number."""
        token = self.get_admin_token()
        client.post(
            "/api/v1/rooms/",
            json={"building": "CS", "room_num": 202, "capacity": 20, "features": []},
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.post(
            "/api/v1/rooms/",
            json={"building": "CS", "room_num": 202, "capacity": 20, "features": []},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 400

    def test_delete_room_as_student_forbidden(self):
        """Students cannot delete rooms."""
        token = self.get_student_token()
        response = client.delete(
            "/api/v1/rooms/1", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403

    def test_delete_room_as_admin(self):
        """Admins can delete rooms."""
        token = self.get_admin_token()
        room = self.db.query(Room).first()
        response = client.delete(
            f"/api/v1/rooms/{room.id}", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

    # -------------------------
    # Reservation endpoint tests
    # -------------------------

    def test_get_reservations_unauthenticated(self):
        """Unauthenticated users cannot get reservations."""
        response = client.get("/api/v1/reservations/")
        assert response.status_code == 401

    def test_create_reservation_as_student(self):
        """Students can create reservations."""
        token = self.get_student_token()
        room = self.db.query(Room).first()
        response = client.post(
            "/api/v1/reservations/",
            json={
                "room_id": room.id,
                "start_time": "2026-04-01T09:00:00",
                "end_time": "2026-04-01T10:00:00",
                "purpose": "Study session",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200

    def test_student_only_sees_own_reservations(self):
        """Students only see their own reservations."""
        student_token = self.get_student_token()
        admin_token = self.get_admin_token()
        room = self.db.query(Room).first()

        # Admin creates a reservation
        client.post(
            "/api/v1/reservations/",
            json={
                "room_id": room.id,
                "start_time": "2026-04-01T09:00:00",
                "end_time": "2026-04-01T10:00:00",
                "purpose": "Admin meeting",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Student creates a reservation
        client.post(
            "/api/v1/reservations/",
            json={
                "room_id": room.id,
                "start_time": "2026-04-02T09:00:00",
                "end_time": "2026-04-02T10:00:00",
                "purpose": "Study session",
            },
            headers={"Authorization": f"Bearer {student_token}"},
        )

        # Student should only see their own
        response = client.get(
            "/api/v1/reservations/",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["purpose"] == "Study session"

    def test_admin_sees_all_reservations(self):
        """Admins can see all reservations."""
        student_token = self.get_student_token()
        admin_token = self.get_admin_token()
        room = self.db.query(Room).first()

        # Both create reservations
        client.post(
            "/api/v1/reservations/",
            json={
                "room_id": room.id,
                "start_time": "2026-04-01T09:00:00",
                "end_time": "2026-04-01T10:00:00",
                "purpose": "Admin meeting",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        client.post(
            "/api/v1/reservations/",
            json={
                "room_id": room.id,
                "start_time": "2026-04-02T09:00:00",
                "end_time": "2026-04-02T10:00:00",
                "purpose": "Study session",
            },
            headers={"Authorization": f"Bearer {student_token}"},
        )

        # Admin should see both
        response = client.get(
            "/api/v1/reservations/", headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert len(response.json()) == 2
