"""Authentication and authorization dependencies.

Authentication mode is controlled by `firebase_enabled` in Settings:

  firebase_enabled = True  →  verify Firebase ID tokens (production / Firebase projects)
  firebase_enabled = False →  verify JWT tokens issued by POST /auth/login

The `X-Dev-User-Email` bypass is intentionally removed from the JWT
path so that every request in non-Firebase mode goes through real
credential verification.
"""
from datetime import datetime, timedelta, timezone

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.services.firebase_auth import verify_firebase_token

# bcrypt context — never store or compare plain passwords outside this module
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return the bcrypt hash of a plain-text password."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if `plain` matches `hashed`."""
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    """Issue a signed JWT that encodes the database user ID."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _decode_token(token: str) -> str:
    """Decode a JWT and return the user ID, or raise 401."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")
        return user_id
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Token invalid or expired: {exc}") from exc


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from a JWT Bearer token.

    When `firebase_enabled = True`, a Firebase ID token is expected instead
    and the existing Firebase verification path is used.

    Raises HTTP 401 if no valid credential is present.
    """
    settings = get_settings()

    if settings.firebase_enabled:
        # Firebase path (unchanged from original implementation)
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
        token = authorization.split(" ", 1)[1]
        decoded = verify_firebase_token(token)
        firebase_uid = decoded["uid"]
        email = decoded.get("email")
        name = decoded.get("name") or (email.split("@")[0] if email else "User")

        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            user = User(firebase_uid=firebase_uid, email=email, name=name, role=UserRole.EMPLOYEE)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # ── JWT path (firebase_enabled = False) ──────────────────────────────────
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Not authenticated. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ", 1)[1]
    user_id = _decode_token(token)

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in (UserRole.ADMIN,):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin privileges required")
    return user


def require_technician_or_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in (UserRole.ADMIN, UserRole.TECHNICIAN):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "IT staff privileges required")
    return user
