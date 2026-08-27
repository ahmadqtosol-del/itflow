from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.session import Base
from app.models.user import gen_id


class IssueAttachment(Base):
    __tablename__ = "issue_attachments"

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

    # IMPORTANT:
    # The existing SQLite database column is "uploaded_by".
    uploaded_by: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    original_filename: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    stored_filename: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    content_type: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    attachment_type: Mapped[str] = mapped_column(
        String,
        default="file",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    issue = relationship(
        "Issue",
        back_populates="attachments",
    )

    uploaded_by_user = relationship(
        "User",
        foreign_keys=[uploaded_by],
    )