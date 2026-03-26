from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import EmailStr
from sqlalchemy.orm import Session

import app.services.user as user_services
from app.schemas.user import(
    UserResponse,
    UserCreate,
    UserUpdate,
)

# from app.core.auth import oauth2_scheme
from app.core.database import get_db
from app.models.user import UserType

'''
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import EmailStr
from sqlalchemy.orm import Session

import app.services.user as user_services
from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import UserType  # only if this is where it lives
'''

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
    return user_services.create_user(db, user)

# /api/users/login -> POST {email, pass}
# I think for this, we want to create an authentication token,
# so we gotta implement some stuff with OAuth2
@api_router.post("/login")
async def login() -> dict:
    # ENDPOINT STUB: need to implement the token stuff first
    return {
        "name": "Ryan Alakija",
        "email": "testing@example.com"
    }

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
    '''update user by ID'''

    new_user = UserUpdate(
        name=name,
        email=email,
        user_type=user_type,
        disabled=disabled
    )
    return user_services.update_user(db, user_id, new_user)

@api_router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    # token: Annotated[str, Depends(oauth2_scheme)],
) -> UserResponse:
    '''delete user by id'''
    return user_services.delete_user(db, user_id)


''' HTML REQUEST METHODS (CRUD = Create, Read, Update, Delete)
        POST =>     Create
        GET =>      Read
        PUT =>      Update
        DELETE =>   Delete
'''

''' EXAMPLE OBTAINED FROM PROFESSOR BACKEND: https://github.com/Spring-2026-CompE-561/proffessor-backend
    Specifically the branch: "feature/march-4"
    src/app/routes/user.py

from typing import TYPE_CHECKING, Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import create_access_token
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.user import Token, UserCreate
from app.schemas.user import User as UserSchema
from app.services.user import user_service

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

api_router = APIRouter(prefix="/user", tags=["users"])


@api_router.post(
    "/register",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    user: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> UserSchema:
    return user_service.create(db, user)


@api_router.post("/login")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    """
    Login and get access token.

    Args:
        form_data: OAuth2 login form (username=email, password)
        db: Database session

    Returns:
        Token: Access token

    Raises:
        HTTPException: If credentials are invalid
    """
    user = user_service.authenticate(
        db,
        email=form_data.username,
        password=form_data.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")  # noqa: S106


@api_router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: Annotated[UserSchema, Depends(get_current_user)],
) -> UserSchema:
    """
    Get current user information.

    Args:
        current_user: The currently authenticated user

    Returns:
        UserSchema: Current user information
    """
    return current_user
'''