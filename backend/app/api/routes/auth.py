"""Authentication endpoints.

POST /auth/login   — exchange email+password for a JWT access token.
GET  /auth/me      — return the currently authenticated user (thin wrapper).
POST /auth/logout  — stateless JWT logout (client discards the token).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, LoginResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email + password and return a JWT token."""
    # Look up by email (case-insensitive)
    user = db.query(User).filter(User.email.ilike(payload.email)).first()

    # Always check password even on miss to prevent timing oracle
    if not user or not user.password_hash:
        # Dummy compare to make response time consistent
        verify_password(payload.password, "$2b$12$dummyhashfortimingnullcase000000000000000000000")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    if user.status == "Disabled":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been disabled.")

    token = create_access_token(user.id)
    return LoginResponse(token=token, user=UserOut.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout():
    """Stateless logout — client must discard the token.
    Returns 204 so the frontend knows the request was handled.
    """
    return None
