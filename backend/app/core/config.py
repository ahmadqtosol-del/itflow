from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central app configuration, loaded from environment variables / .env.

    Nothing in the rest of the codebase should read os.environ directly —
    always go through `get_settings()` so every value has one source of
    truth and a sane default for local development.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "ITFlow API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    frontend_origin: str = "http://localhost:5173"

    # Database — defaults to a local SQLite file. Point DATABASE_URL at a
    # Postgres instance in production, e.g.
    # postgresql+psycopg://user:pass@host:5432/itflow
    database_url: str = "sqlite:///./itflow.db"

    # Firebase Authentication
    # Path to a service account JSON file used to verify ID tokens and
    # (optionally) manage users server-side.
    firebase_credentials_path: str = "firebase-service-account.json"
    # Allows the API to boot without real Firebase credentials in local
    # dev/demo environments — auth falls back to a dev bypass header.
    firebase_enabled: bool = False

    # Resend (transactional email)
    resend_api_key: str = ""
    resend_from_email: str = "ITFlow <notifications@itflow.dev>"
    email_enabled: bool = False

    # JWT authentication (used when firebase_enabled is False)
    # Generate a strong value for production: python -c "import secrets; print(secrets.token_hex(32))"
    jwt_secret: str = "itflow-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # Default admin bootstrap (used only the first time the DB is empty)
    default_admin_email: str = "admin@itflow.dev"
    default_admin_name: str = "IT Administrator"

    # SLA targets in minutes, keyed by priority
    sla_response_minutes: dict = {"CRITICAL": 15, "HIGH": 30, "MEDIUM": 120, "LOW": 240}
    sla_resolution_minutes: dict = {"CRITICAL": 30, "HIGH": 120, "MEDIUM": 480, "LOW": 1440}


@lru_cache
def get_settings() -> Settings:
    return Settings()
