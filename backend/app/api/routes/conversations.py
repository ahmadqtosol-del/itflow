"""Direct messaging endpoints.

Every authenticated user can use direct messaging — this is NOT admin-only.
All conversation access is gated by participant verification in the CRUD layer.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.crud import message as msg_crud
from app.crud import notification as notification_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.message import (
    ConversationCreate,
    ConversationOut,
    DirectMessageCreate,
    DirectMessageOut,
    UserDirectoryOut,
)
from app.services import email_service
from app.services.ws_manager import manager

router = APIRouter(tags=["messages"])


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _other_user(conv, current_user_id: str) -> User:
    return conv.user_b if conv.user_a_id == current_user_id else conv.user_a


def _serialize_conversation(conv, current_user_id: str) -> ConversationOut:
    other = _other_user(conv, current_user_id)
    last_msg = conv.messages[-1] if conv.messages else None
    unread = msg_crud.unread_count_from_list(conv.messages, reader_id=current_user_id)
    return ConversationOut(
        id=conv.id,
        other_user_id=other.id,
        other_user_name=other.name,
        other_user_department=other.department,
        other_user_avatar_color=other.avatar_color,
        other_user_status=other.status,
        last_message=last_msg.body if last_msg else None,
        last_message_at=last_msg.created_at if last_msg else None,
        unread_count=unread,
        updated_at=conv.updated_at,
    )


def _serialize_message(msg: "DirectMessage") -> DirectMessageOut:
    return DirectMessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender_name=msg.sender.name if msg.sender else None,
        body=msg.body,
        read=msg.read,
        created_at=msg.created_at,
    )


# ─── Directory ─────────────────────────────────────────────────────────────────
@router.get("/directory", response_model=list[UserDirectoryOut])
def get_directory(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return every user except the current user for the New Message picker."""
    return msg_crud.get_directory(db, exclude_user_id=user.id)


# ─── Conversations ─────────────────────────────────────────────────────────────
@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    convs = msg_crud.list_conversations(db, user_id=user.id)
    return [_serialize_conversation(c, user.id) for c in convs]


@router.post("/conversations", response_model=ConversationOut, status_code=status.HTTP_200_OK)
def get_or_create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Idempotent — always returns the single canonical conversation for this pair."""
    conv = msg_crud.get_or_create_conversation(
        db, user_id=user.id, other_user_id=payload.other_user_id
    )
    # Eager-load messages and users needed for serialization
    db.refresh(conv)
    return _serialize_conversation(conv, user.id)


# ─── Messages ──────────────────────────────────────────────────────────────────
@router.get("/conversations/{conversation_id}/messages", response_model=list[DirectMessageOut])
def get_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    msgs = msg_crud.list_messages(db, conversation_id=conversation_id, user_id=user.id)
    return [_serialize_message(m) for m in msgs]


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=DirectMessageOut,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: str,
    payload: DirectMessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 1. Persist to database
    msg = msg_crud.send_message(
        db, conversation_id=conversation_id, sender_id=user.id, body=payload.body
    )

    # 2. Determine recipient
    conv = msg_crud.get_conversation(db, conversation_id=conversation_id, user_id=user.id)
    recipient = _other_user(conv, user.id)

    # 3. Create in-app notification for recipient
    notification_crud.create_notification(
        db,
        user_id=recipient.id,
        category="Messages",
        title=f"New message from {user.name}.",
    )

    # 4. Broadcast MESSAGE_CREATED so recipient's frontend updates in real-time
    await manager.broadcast(
        "MESSAGE_CREATED",
        {
            "conversation_id": conversation_id,
            "sender_id": user.id,
            "sender_name": user.name,
            "message_id": msg.id,
            "body": msg.body,
            "created_at": msg.created_at.isoformat(),
        },
    )

    # 5. Broadcast NOTIFICATION so recipient's bell updates in real-time
    await manager.broadcast(
        "NOTIFICATION",
        {"user_id": recipient.id, "category": "Messages", "title": f"New message from {user.name}."},
    )

    # 6. Fire-and-forget email (never blocks message delivery)
    email_service.send_direct_message_email(recipient.email, user.name, payload.body[:140])

    return _serialize_message(msg)


@router.post("/conversations/{conversation_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    msg_crud.mark_read(db, conversation_id=conversation_id, reader_id=user.id)
    return None
