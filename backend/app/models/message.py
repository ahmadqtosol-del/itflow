"""Direct messaging models — one Conversation per user-pair, N DirectMessages per Conversation."""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.user import gen_id


class Conversation(Base):
    """Canonical one-to-one conversation between two users.

    Participants are stored with canonical ordering (user_a_id < user_b_id
    lexicographically) so that looking up "the conversation between A and B"
    returns the same row regardless of who initiated the thread.
    """
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint("user_a_id", "user_b_id", name="uq_conversation_participants"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_a_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    user_b_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user_a = relationship("User", foreign_keys=[user_a_id])
    user_b = relationship("User", foreign_keys=[user_b_id])
    messages = relationship(
        "DirectMessage", back_populates="conversation", order_by="DirectMessage.created_at"
    )


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id"))
    sender_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
