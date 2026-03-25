"""User repository."""

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:

    @staticmethod
    def get_all(db: Session) -> list[User] | None:
        """Get all users in the system.
        
        Args:
            db: Database
            
        Returns:
            list[User] | None
        """
        return db.query(User).all()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        """Get a specific user by ID.
        
        Args:
            db: Database
            user_id: ID of the user to retrieve
            
        Returns:
            User | None
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        """Get a specific user by email. Used for login.
        
        Args:
            db: Database
            email: Email of the user to retrieve
            
        Returns:
            User | None
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, user: UserCreate, hashed_password: str) -> User:
        """Create a new user.
        
        Args:
            db: Database
            user: User data to create
            hashed_password: Hashed password to store
            
        Returns:
            Created User
        """
        db_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password,
            user_type=user.user_type,
            disabled=user.disabled,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, user_id: int, user: UserUpdate) -> User | None:
        """Update a user's information.
        
        Args:
            db: Database session
            user_id: ID of the user to update
            user: Updated user data
            
        Returns:
            Updated User | None
        """
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user is None:
            return None
        for key, value in user.model_dump(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def delete(db: Session, user: User | None) -> User | None:
        """Delete a user.
        
        Args:
            db: Database session
            user: User to delete
            
        Returns:
            Deleted User | None
        """
        if user is None:
            return None
        db.delete(user)
        db.commit()
        return user