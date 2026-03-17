"""Reservation repository."""

from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.schemas.reservation import ReservationCreate


class ReservationRepository:
    """Reservation repository data access."""

    @staticmethod
    def get_all(db: Session) -> list[Reservation] | None:
        """Get all reservations in the system.

        Args:
            db: Database

        Returns:
            list[ReservationCreate] | None"""
        return db.query(Reservation).all()

    @staticmethod
    def get_by_id(db: Session, reservation_id: int) -> list[Reservation] | None:
        """Get all reservations in the system.

        Args:
            db: Database

        Returns:
            list[ReservationCreate] | None"""
        return db.query(Reservation).filter(Reservation.id == reservation_id).first()

    @staticmethod
    def create(db: Session, reservation: ReservationCreate) -> ReservationCreate:
        """Create a new reservation.

        Args:
            db: Database
            reservation: Reservation to create

        Returns:
            Created Reservation"""
        db_reservation = Reservation(
            start_time=ReservationCreate.start_time,
            end_time=ReservationCreate.end_time,
            purpose=ReservationCreate.purpose,
            user_id=ReservationCreate.user_id,
            room_id=ReservationCreate.room_id,
        )

        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        return db_reservation

    @staticmethod
    def delete(db: Session, reservation: Reservation) -> Reservation:
        """Create a new reservation.

        Args:
            db: Database
            reservation: Reservation to create

        Returns:
            Created Reservation"""

        db.delete(reservation)
        db.commit()

    @staticmethod
    def update(
        db: Session, reservation_id: int, reservation: Reservation
    ) -> Reservation:
        """Update a reservation.

        Args:
            db: Database Session
            reservation_id: integer reservation id
            reservation: Reservation information

        Returns:
            ReservationResponse
        """
        db.commit()
        db.refresh(reservation)
        return reservation
