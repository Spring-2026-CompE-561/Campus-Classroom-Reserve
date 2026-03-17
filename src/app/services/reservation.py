from sqlalchemy.orm import Session

# from app.repository.category import RoomRepository
from app.repository.reservation import ReservationRepository
from app.schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
)


RESERVATION_NOT_FOUND_MSG = "Reservation not found or access denied."
ROOM_NOT_FOUND_MSG = "Room not found."


def create_reservation(
    db: Session, reservation: ReservationCreate, user_id: int
) -> ReservationResponse:
    """Create a new reservation.

    Args:
        db: Database Session
        reservation: Reservation creation data
        user_id: ID of user creating the reservation

    Returns:
        Reservation: Created reservation
    """
    # TODO: Integrate with database
    db_transaction = ReservationRepository.create(db, reservation, user_id)

    return ReservationResponse(
        room_id=db_transaction.room_id,
        user_id=db_transaction.user_id,
        start_time=db_transaction.start_time,
        end_time=db_transaction.end_time,
        purpose=db_transaction.purpose,
    )


def get_reservations(
    db: Session,
) -> list[ReservationResponse]:
    """Get all reservations for a user.

    Args:
        db: Database Session

    Returns:
        list[ReservationResponse]: List of reservations
    """
    reservations = ReservationRepository.get_all(db)
    return [
        ReservationResponse(
            room_id=reservation.room_id,
            user_id=reservation.user_id,
            start_time=reservation.start_time,
            end_time=reservation.end_time,
            purpose=reservation.purpose,
        )
        for reservation in reservations
    ]


def get_reservation_by_id(
    db: Session, reservation_id: int
) -> ReservationResponse | None:
    """Get a specific reservation.

    Args:
        db: Database Session
        reservation_id: integer reservation id

    Returns:
        ReservationResponse | None"""
    return ReservationRepository.get_by_id(db, reservation_id)
