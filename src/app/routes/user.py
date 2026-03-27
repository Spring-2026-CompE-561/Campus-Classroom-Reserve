from typing import Annotated

from fastapi import APIRouter, Depends
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

# user should have the following endpoints
#  /api/users -> GET {NONE}
#  /api/users/signup -> POST {name, email, pass}
#  /api/users/login -> POST {email, pass}
#  /api/users/{id} -> PUT {name, email}
#  /api/users/{id} -> DELETE {NONE}


# /api/users/signup -> POST {name, email, pass}
# client sends name, email, and password
@api_router.post("/signup")
async def signup_user(
    db: Annotated[Session, Depends(get_db)],
    user: UserCreate,
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> UserResponse:
    # sign up / create a new user
    # TODO: add logic to validate user emails with EmailStr here (?)
    return user_services.signup(user, db)


# /api/users/login -> POST {email, pass}
# I think for this, we want to create an authentication token,
# so we gotta implement some stuff with OAuth2
@api_router.post("/login")
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
    return user_services.login(form_data, db)


# /api/users -> GET {NONE}
# client does not send any parameters
@api_router.get("/")
async def get_users(
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> list[UserResponse]:
    return user_services.get_all(db)


@api_router.get("/{user_id}")
async def get_user_by_id(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> UserResponse:
    return user_services.get_user_by_id(db, user_id)


#  /api/users/{id} -> PUT {name, email}
@api_router.put("/{user_id}")
async def update_user(
    db: Annotated[Session, Depends(get_db)],
    user_id: int,
    name: str | None = None,
    email: EmailStr | None = None,
    user_type: UserType | None = None,
    disabled: bool | None = None,
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> UserResponse:
    """update user by ID"""

    new_user = UserUpdate(
        name=name, email=email, user_type=user_type, disabled=disabled
    )
    return user_services.update_user(db, user_id, new_user)


@api_router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> UserResponse:
    """delete user by id"""
    return user_services.delete_user(db, user_id)


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
