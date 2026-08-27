from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    category: str
    title: str
    read: bool
    created_at: datetime
    related_issue_id: str | None = None


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    actor_label: str
    action: str
    target: str
    category: str
    created_at: datetime
