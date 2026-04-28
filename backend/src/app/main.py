from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import api_router
from app.core.database import Base, engine, get_db
from app.core.settings import settings
from app.models.room import Room
from app.models.reservation import Reservation
from datetime import datetime

from app.models.user import User, UserType


# Create database tables
# If the tables do not exist, create them
Base.metadata.create_all(bind=engine)

db = get_db().send(None)
if len(db.query(Reservation).all()) == 0:
    db.add(
        Reservation(
            room_id=0,
            user_id=0,
            start_time=datetime.now(),
            end_time=datetime.now(),
            purpose="DEBUG",
        )
    )
if len(db.query(Room).all()) == 0:
    db.add(Room(building="DEBUG", room_num=0, capacity=0, features=[]))
if len(db.query(User).all()) == 0:
    db.add(
        User(
            email="debug@debug.com",
            hashed_password="1234",
            name="Debug McDebuginson",
            user_type=UserType.admin,
            disabled=True,
        )
    )
db.commit()

app = FastAPI(
    title=settings.app_name,
    description="An API for managing classroom reservations",
    version=settings.app_version,
)

app.include_router(api_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
