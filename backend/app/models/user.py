import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, String, Float, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class UserRole(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    TECHNICIAN = "TECHNICIAN"
    ADMIN = "ADMIN"


class UserStatus(str, enum.Enum):
    ACTIVE = "Active"
    DISABLED = "Disabled"
    AVAILABLE = "Available"
    BUSY = "Busy"
    AWAY = "Away"
    OFFLINE = "Offline"


def gen_id() -> str:
    return uuid.uuid4().hex[:12]


class User(Base):
    """A single table backs employees, technicians, and admins —
    distinguished by `role` — since they share the same identity,
    auth, and profile concerns and the frontend already treats them
    as one `User` shape with role-specific extra fields.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    firebase_uid: Mapped[str | None] = mapped_column(String, unique=True, nullable=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.EMPLOYEE)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_color: Mapped[str] = mapped_column(String, default="#3b82f6")
    status: Mapped[str] = mapped_column(String, default=UserStatus.ACTIVE.value)

    # Password-based auth (used when firebase_enabled is False).
    # bcrypt hash stored here; never plain text.
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)

    # Technician-only fields (null for employees)
    specialization: Mapped[str | None] = mapped_column(String, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    sla_success_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    # When this account was registered by an admin. Set once, automatically,
    # by the database itself — never touched again after creation.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    reported_issues = relationship(
        "Issue", back_populates="employee", foreign_keys="Issue.employee_id"
    )
    assigned_issues = relationship(
        "Issue", back_populates="technician", foreign_keys="Issue.technician_id"
    )