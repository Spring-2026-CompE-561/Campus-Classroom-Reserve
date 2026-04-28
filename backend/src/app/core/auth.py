from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import JWT, jwk
from jwt.exceptions import JWTDecodeError, JWTException
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.settings import settings

ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Build a symmetric JWK from the raw secret string
_signing_key = jwk.jwk_from_dict(
    {"kty": "oct", "k": settings.secret_key.encode().hex()}
)
_jwt_instance = JWT()

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/user/login")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token.

    Args:
        data: Claims to encode (e.g. ``{"sub": "user@sdsu.edu"}``).
        expires_delta: Custom TTL; defaults to 15 minutes.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode["exp"] = int(expire.timestamp())
    return _jwt_instance.encode(to_encode, _signing_key, alg=ALGORITHM)


def get_password_hash(password: str) -> str:
    """Return the bcrypt hash of *password*."""
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return ``True`` when *plain_password* matches *hashed_password*."""
    return password_hash.verify(plain_password, hashed_password)


def verify_token(token: str) -> dict | None:
    """Decode and verify a JWT.

    Returns the payload dict on success, or ``None`` if the token is
    invalid, expired, or tampered with.
    """
    try:
        payload = _jwt_instance.decode(
            token,
            _signing_key,
            algorithms=[ALGORITHM],
            do_time_check=True,
        )
    except (JWTDecodeError, JWTException, Exception):
        return None
    return payload


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    """FastAPI dependency — resolve the authenticated user from a Bearer token.

    Raises HTTP 401 if the token is missing, invalid, expired, or the
    referenced user no longer exists in the database.

    Returns:
        User ORM object for the authenticated user.
    """
    # Import here to avoid circular imports at module load time
    from app.repository.user import UserRepository

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    email: str | None = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = UserRepository.get_by_email(db, email)
    if user is None:
        raise credentials_exception

    return user
