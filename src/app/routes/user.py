from fastapi import APIRouter

api_router = APIRouter(prefix="/user", tags=["users"])

@api_router.get("/login")
async def read_users() -> dict:
    return {
        "message": "User created",
        "List of users": # user
    }

'''adding some endpoints'''

# /api/users -> GET {NONE}
# should it be return None, or do we want to return a list of users?
@api_router.get("/")
async def default():
    return None

# /api/users/signup -> POST {name, email, pass}
@api_router.post("/signup")
async def register() -> dict:
    # get their name, email (unique), and password (unique)
    return {
        "name": ,
        "email": ,
        "password": 
    }

# /api/users/login -> POST {email, pass}
# I think for this, we want to get an authentication token,
# so we gotta implement some stuff with OAuth2
@api_router.post("/login")
def login() -> dict:
    return {
        ""
    }

@api_router.put("/{user_id}")
async def 

# user should have the following endpoints
#  /api/users -> GET {NONE}
#  /api/users/signup -> POST {name, email, pass}
#  /api/users/login -> POST {email, pass}
#  /api/users/{id} -> PUT {name, email}
#  /api/users/{id} -> DELETE {NONE}

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