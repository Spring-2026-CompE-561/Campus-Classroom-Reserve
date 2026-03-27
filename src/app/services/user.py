# business logic

from datetime import timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.core.database import get_db
from app.repository.user import UserRepository
from app.schemas.user import Token, UserCreate, UserUpdate, UserResponse

USER_NOT_FOUND_MSG = "User not found / access denied."


# mostly CRUD operations => create user, get user (by id or email) / users, update user, delete user


def get_all(db: Session) -> list[UserResponse]:
    """Get all users

    Args:
        db: Database session

    Returns:
        list[UserResponse]: List of users
    """
    users = UserRepository.get_all(db)
    return [
        UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            hashed_password=user.hashed_password,
            user_type=user.user_type,
            disabled=user.disabled,
        )
        for user in users
    ]


def get_user_by_id(db: Session, user_id: int) -> UserResponse | None:
    """Get a specific user

    Args:
        db: Database session
        user_id: integer user id

    Returns:
        UserResponse | None
    """

    user = UserRepository.get_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MSG
        )

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        hashed_password=user.hashed_password,
        user_type=user.user_type,
        disabled=user.disabled,
    )


def get_user_by_email(db: Session, email: str) -> UserResponse | None:
    """Get a specific user

    Args:
        db: Database session
        email: string user email

    Returns:
        UserResponse | None
    """

    user = UserRepository.get_by_email(db, email)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MSG
        )

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        hashed_password=user.hashed_password,
        user_type=user.user_type,
        disabled=user.disabled,
    )


def update_user(
    db: Session,
    user_id: int,
    user_data: UserUpdate,
) -> UserResponse:
    """Update a user.

    Args:
        db: Database session
        user_id: int
        user_data: updated user information

    Returns:
        UserResponse
    """

    user = UserRepository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MSG
        )

    if user_data.name is not None:
        user_data.name = user.name
    if user_data.email is not None:
        user_data.email = user.email
    if user_data.user_type is not None:
        user_data.user_type = user.user_type
    if user_data.disabled is not None:
        user_data.disabled = user_data.disabled

    updated = UserRepository.update(db, user_id=user_id, user=user_data)

    return UserResponse(
        id=updated.id,
        name=updated.name,
        email=updated.email,
        hashed_password=updated.hashed_password,
        user_type=updated.user_type,
        disabled=updated.disabled,
    )


def delete_user(db: Session, user_id: int) -> UserResponse:
    """Delete a user.

    Args:
        db: Database Session
        user_id: integer user id

    Returns:
        UserResponse
    """

    result = UserRepository.delete(db, UserRepository.get_by_id(db, user_id))
    if result is not None:
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MSG
        )


def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    # OAuth2PasswordRequestForm uses the field name "username" but we treat
    # it as an email address per our user model.
    user = UserRepository.get_by_email(db, form_data.username)
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, token_type="bearer")


def signup(
    user_in: UserCreate, db: Annotated[Session, Depends(get_db)]
) -> UserResponse:
    """Register a new user.

    Returns the created user (without the password).
    Raises 409 if the email address is already registered.
    """
    existing = UserRepository.get_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    hashed = get_password_hash(user_in.password)
    user = UserRepository.create(db, user_in, hashed_password=hashed)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="EMAIL ALREADY IN USE."
        )
    return user
