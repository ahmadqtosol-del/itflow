import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.user import gen_id


class IssueStatus(str, enum.Enum):
    NEW = "NEW"
    QUEUED = "QUEUED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING = "WAITING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class IssuePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


def next_issue_number(db) -> str:
    """
    Generate the next human-friendly issue ID.

    Example:
        IT-101
        IT-102
        IT-103
    """
    from sqlalchemy import func as sa_func

    count = db.query(sa_func.count(Issue.id)).scalar() or 0

    return f"IT-{100 + count + 1}"


class Issue(Base):
    __tablename__ = "issues"

    # ---------------------------------------------------------
    # BASIC ISSUE INFORMATION
    # ---------------------------------------------------------

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    title: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    # ---------------------------------------------------------
    # PRIORITY / STATUS
    # ---------------------------------------------------------

    priority: Mapped[IssuePriority] = mapped_column(
        Enum(IssuePriority),
        default=IssuePriority.MEDIUM,
        nullable=False,
    )

    status: Mapped[IssueStatus] = mapped_column(
        Enum(IssueStatus),
        default=IssueStatus.NEW,
        nullable=False,
    )

    # ---------------------------------------------------------
    # USERS
    # ---------------------------------------------------------

    employee_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    technician_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    # ---------------------------------------------------------
    # DEVICE / LOCATION / DEPARTMENT
    # ---------------------------------------------------------

    device: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    department: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    # ---------------------------------------------------------
    # TIMESTAMPS
    # ---------------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    responded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ---------------------------------------------------------
    # TECHNICAL / RESOLUTION INFORMATION
    # ---------------------------------------------------------

    root_cause: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    resolution: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    time_spent_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # ---------------------------------------------------------
    # EMPLOYEE FEEDBACK
    # ---------------------------------------------------------

    employee_rating: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    employee_feedback: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ---------------------------------------------------------
    # ATTACHMENT
    # ---------------------------------------------------------

    has_attachment: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # ---------------------------------------------------------
    # RELATIONSHIPS
    # ---------------------------------------------------------

    # Employee who originally submitted the issue.
    employee = relationship(
        "User",
        back_populates="reported_issues",
        foreign_keys="Issue.employee_id",
    )

    # Technician currently assigned to the issue.
    technician = relationship(
        "User",
        back_populates="assigned_issues",
        foreign_keys="Issue.technician_id",
    )

    # Issue activity/history.
    timeline_events = relationship(
        "IssueTimelineEvent",
        back_populates="issue",
        order_by="IssueTimelineEvent.created_at",
        cascade="all, delete-orphan",
    )

    # Chat/comments attached to the issue.
    comments = relationship(
        "IssueComment",
        back_populates="issue",
        order_by="IssueComment.created_at",
        cascade="all, delete-orphan",
    )

    # Files/screenshots attached to the issue.
    attachments = relationship(
        "IssueAttachment",
        back_populates="issue",
        cascade="all, delete-orphan",
    )


class IssueTimelineEvent(Base):
    __tablename__ = "issue_timeline_events"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=gen_id,
    )

    issue_id: Mapped[str] = mapped_column(
        ForeignKey("issues.id"),
        nullable=False,
        index=True,
    )

    label: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    issue = relationship(
        "Issue",
        back_populates="timeline_events",
    )


class IssueComment(Base):
    """
    Chat-style communication thread attached to a single issue.
    """

    __tablename__ = "issue_comments"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=gen_id,
    )

    issue_id: Mapped[str] = mapped_column(
        ForeignKey("issues.id"),
        nullable=False,
        index=True,
    )

    author_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    issue = relationship(
        "Issue",
        back_populates="comments",
    )

    author = relationship(
        "User",
    )