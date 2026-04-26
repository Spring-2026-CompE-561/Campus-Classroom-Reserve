from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
import app.services.user as user_services
from app.schemas.user import (
    Token,
    UserResponse,
    UserCreate,
    UserUpdate,
)

from app.core.database import get_db
from app.models.user import User, UserType

api_router = APIRouter(prefix="/user", tags=["users"])


@api_router.post("/signup")
async def signup_user(
    db: Annotated[Session, Depends(get_db)],
    user: UserCreate,
) -> UserResponse:
    return user_services.signup(user, db)


@api_router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    return user_services.login(form_data, db)


@api_router.get("/")
async def get_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[UserResponse]:
    if current_user.user_type != UserType.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return user_services.get_all(db)


@api_router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    return current_user


@api_router.get("/{user_id}")
async def get_user_by_id(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    if current_user.user_type != UserType.admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return user_services.get_user_by_id(db, user_id)


@api_router.put("/{user_id}")
async def update_user(
    db: Annotated[Session, Depends(get_db)],
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    name: str | None = None,
    email: EmailStr | None = None,
    user_type: UserType | None = None,
    disabled: bool | None = None,
) -> UserResponse:
    if current_user.user_type != UserType.admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    new_user = UserUpdate(
        name=name, email=email, user_type=user_type, disabled=disabled
    )
    return user_services.update_user(db, user_id, new_user)


@api_router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    if current_user.user_type != UserType.admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized."
        )
    return user_services.delete_user(db, user_id)
