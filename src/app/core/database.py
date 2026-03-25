from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.settings import settings

# if TYPE_CHECKING:
from collections.abc import Generator

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args=(
        {"check_same_thread": False}
        if settings.database_url.startswith("sqlite")
        else {}
    ),
)


test_engine = create_engine(
    "sqlite:///./debug_database.db",
    connect_args=(
        {"check_same_thread": False}
        if settings.database_url.startswith("sqlite")
        else {}
    ),
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base = declarative_base()


def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_test_db() -> Generator[Session]:
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
