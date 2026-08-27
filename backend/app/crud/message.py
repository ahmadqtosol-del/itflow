"""CRUD helpers for Conversation and DirectMessage models."""
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.models.message import Conversation, DirectMessage
from app.models.user import User


# ─── Canonical participant ordering ──────────────────────────────────────────
def _sorted_pair(id_a: str, id_b: str) -> tuple[str, str]:
    """Return (lower_id, higher_id) so the unique constraint always resolves
    to the same row regardless of who initiates the conversation."""
    return (id_a, id_b) if id_a < id_b else (id_b, id_a)


# ─── Directory ────────────────────────────────────────────────────────────────
def get_directory(db: Session, *, exclude_user_id: str) -> list[User]:
    """Return every user except the requesting user, ordered by name."""
    return (
        db.query(User)
        .filter(User.id != exclude_user_id)
        .order_by(User.name)
        .all()
    )


# ─── Conversations ────────────────────────────────────────────────────────────
def get_or_create_conversation(db: Session, *, user_id: str, other_user_id: str) -> Conversation:
    """Idempotent — returns the existing conversation or creates a new one."""
    if user_id == other_user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot start a conversation with yourself.")

    other = db.get(User, other_user_id)
    if not other:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Recipient user not found.")

    a_id, b_id = _sorted_pair(user_id, other_user_id)
    conv = (
        db.query(Conversation)
        .filter(Conversation.user_a_id == a_id, Conversation.user_b_id == b_id)
        .first()
    )
    if conv:
        return conv

    conv = Conversation(user_a_id=a_id, user_b_id=b_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def list_conversations(db: Session, *, user_id: str) -> list[Conversation]:
    """Return all conversations for a user, ordered by most recently updated."""
    return (
        db.query(Conversation)
        .filter(or_(Conversation.user_a_id == user_id, Conversation.user_b_id == user_id))
        .order_by(Conversation.updated_at.desc())
        .all()
    )


def get_conversation(db: Session, *, conversation_id: str, user_id: str) -> Conversation:
    """Fetch a conversation — 403 if the requesting user is not a participant."""
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found.")
    if user_id not in (conv.user_a_id, conv.user_b_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a participant in this conversation.")
    return conv


# ─── Messages ─────────────────────────────────────────────────────────────────
def list_messages(db: Session, *, conversation_id: str, user_id: str) -> list[DirectMessage]:
    """Return all messages in a conversation (auth check included)."""
    get_conversation(db, conversation_id=conversation_id, user_id=user_id)
    return (
        db.query(DirectMessage)
        .filter(DirectMessage.conversation_id == conversation_id)
        .order_by(DirectMessage.created_at)
        .all()
    )


def send_message(db: Session, *, conversation_id: str, sender_id: str, body: str) -> DirectMessage:
    """Persist a DirectMessage. Bumps conversation.updated_at via onupdate."""
    conv = get_conversation(db, conversation_id=conversation_id, user_id=sender_id)

    body = body.strip()
    if not body:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Message body cannot be empty.")

    msg = DirectMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        body=body,
        read=False,
    )
    db.add(msg)

    # Manually bump updated_at so ordering works immediately (onupdate fires on flush)
    conv.updated_at = datetime.utcnow()
    db.add(conv)

    db.commit()
    db.refresh(msg)
    return msg


def mark_read(db: Session, *, conversation_id: str, reader_id: str) -> None:
    """Mark all messages NOT sent by the reader as read."""
    get_conversation(db, conversation_id=conversation_id, user_id=reader_id)
    (
        db.query(DirectMessage)
        .filter(
            DirectMessage.conversation_id == conversation_id,
            DirectMessage.sender_id != reader_id,
            DirectMessage.read.is_(False),
        )
        .update({"read": True})
    )
    db.commit()


def unread_count(db: Session, *, conversation_id: str, reader_id: str) -> int:
    """Count unread messages in a conversation for the given reader."""
    return (
        db.query(func.count(DirectMessage.id))
        .filter(
            DirectMessage.conversation_id == conversation_id,
            DirectMessage.sender_id != reader_id,
            DirectMessage.read.is_(False),
        )
        .scalar()
        or 0
    )


def unread_count_from_list(messages: list, *, reader_id: str) -> int:
    """Count unread messages from an already-loaded list (avoids extra query)."""
    return sum(1 for m in messages if not m.read and m.sender_id != reader_id)
