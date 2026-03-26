"""User routes.

Provides:
  POST /api/v1/user/signup  — register a new user
  POST /api/v1/user/login   — authenticate and receive a JWT (OAuth2 password flow)
  GET  /api/v1/user/me      — return the currently authenticated user
"""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.core.database import get_db
from app.models.user import User
from app.repository.user import UserRepository
from app.schemas.user import Token, UserCreate, UserResponse

api_router = APIRouter(prefix="/user", tags=["users"])


@api_router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup(
    user_in: UserCreate,
    db: Annotated[Session, Depends(get_db)],
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
    return user


@api_router.post(
    "/login",
    response_model=Token,
)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    """Authenticate a user and return a JWT Bearer token.

    Accepts standard OAuth2 form fields: `username` (email) and `password`.
    Returns a token that must be sent as `Authorization: Bearer <token>` on
    subsequent requests to protected endpoints.

    Raises 401 if credentials are invalid.
    """
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


@api_router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Return the profile of the currently authenticated user.

    Requires a valid Bearer token in the Authorization header.
    """
    return current_user
