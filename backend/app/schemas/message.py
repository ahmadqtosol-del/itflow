from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class DirectMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str | None = None
    body: str
    read: bool
    created_at: datetime


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    other_user_id: str
    other_user_name: str
    other_user_department: str | None = None
    other_user_avatar_color: str
    other_user_status: str
    last_message: str | None = None
    last_message_at: datetime | None = None
    unread_count: int = 0
    updated_at: datetime


class ConversationCreate(BaseModel):
    other_user_id: str


class DirectMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class UserDirectoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    role: str
    department: str | None = None
    avatar_color: str
    status: str
