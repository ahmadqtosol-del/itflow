"""Firebase Authentication integration.

ITFlow uses Firebase only for identity: sign-up/sign-in, password
resets, and issuing ID tokens happen entirely on the frontend via the
Firebase client SDK. This module's only job is to verify the ID token
the frontend sends on each request and hand back the decoded claims —
role, department, and everything else IT-specific stays in our own
`users` table (see app/core/security.py).
"""
import functools
import os

from fastapi import HTTPException, status

from app.core.config import get_settings


@functools.lru_cache
def _get_firebase_app():
    import firebase_admin
    from firebase_admin import credentials

    settings = get_settings()
    if not os.path.exists(settings.firebase_credentials_path):
        raise RuntimeError(
            f"Firebase is enabled but credentials file "
            f"'{settings.firebase_credentials_path}' was not found. "
            f"Download a service-account key from the Firebase console "
            f"(Project settings → Service accounts) or set "
            f"FIREBASE_CREDENTIALS_PATH to its location."
        )
    cred = credentials.Certificate(settings.firebase_credentials_path)
    return firebase_admin.initialize_app(cred)


def verify_firebase_token(id_token: str) -> dict:
    """Verifies a Firebase ID token and returns its decoded claims.

    Raises HTTP 401 on any invalid/expired token so callers can just
    propagate the exception.
    """
    from firebase_admin import auth as firebase_auth

    _get_firebase_app()
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as exc:  # noqa: BLE001 - firebase raises several distinct exception types
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid Firebase token: {exc}") from exc

    return {
        "uid": decoded["uid"],
        "email": decoded.get("email"),
        "name": decoded.get("name"),
        "email_verified": decoded.get("email_verified", False),
    }
