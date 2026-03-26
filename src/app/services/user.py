# business logic

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repository.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse

USER_NOT_FOUND_MSG = "User not found / access denied."

# mostly CRUD operations => create user, get user (by id or email) / users, update user, delete user

def create_user(
    db: Session,
    user: UserCreate
) -> UserResponse:
    
    '''Create a new user.

    Args:
        db: Database session
        user: User creation data

    Returns:
        User: Created user (server response)
    '''

    # first, hash user password
    # TODO: implement a function to hash password (either also in services or core?)
    # hashed_password = hash_password(user.password)

    # PLACEHOLDER VARIABLE
    hashed_password = "#####$J#K$J#K$J#$K#$J#K$#J$KFJDSKFJ"

    db_user = UserRepository.create(db, user, hashed_password)

    return UserResponse(
        id=db_user.id,
        name=db_user.name,
        email=db_user.email,
        hashed_password=hashed_password,
        user_type=db_user.user_type,
        disabled=db_user.disabled,
    )

def get_users(
    db: Session
) -> list[UserResponse]:
    '''Get all users

    Args:
        db: Database session
    
    Returns:
        list[UserResponse]: List of users
    '''
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

def get_user_by_id(
    db: Session, user_id: int
) -> UserResponse | None:
    '''Get a specific user

    Args:
        db: Database session
        user_id: integer user id

    Returns:
        UserResponse | None
    '''

    user = UserRepository.get_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=USER_NOT_FOUND_MSG
        )
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        hashed_password=user.hashed_password,
        user_type=user.user_type,
        disabled=user.disabled,
    )

def get_user_by_email(
    db: Session, email: str
) -> UserResponse | None:
    '''Get a specific user

    Args:
        db: Database session
        email: string user email

    Returns:
        UserResponse | None
    '''

    user = UserRepository.get_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=USER_NOT_FOUND_MSG
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
    '''Update a user.

    Args:
        db: Database session
        user_id: int
        user_data: updated user information
    
    Returns:
        UserResponse
    '''

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
    
    updated = UserRespository.update(
        db, user_id=user_id, user=user_data
    )

    return UserResponse(
        id=updated.id,
        name=updated.name,
        email=updated.email,
        hashed_password=updated.hashed_password,
        user_type=updated.user_type,
        disabled=updated.disabled,
    )

def delete_user(db: Session, user_id: int) -> UserResponse:
    '''Delete a user.
    
    Args:
        db: Database Session
        user_id: integer user id

    Returns:
        UserResponse
    '''

    result = UserRepository.delete(
        db, UserRepository.get_by_id(db, user_id)
    )
    if result is not None:
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESERVATION_NOT_FOUND_MSG
        )
