from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.attachment import AttachmentOut


class IssueEmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    department: str | None = None


class IssueTechnicianOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str


class TimelineEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    label: str
    created_at: datetime


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    body: str
    created_at: datetime
    author_id: str
    author_name: str | None = None


class IssueCreate(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=200,
    )

    description: str = Field(
        min_length=1,
    )

    category: str

    priority: str = "MEDIUM"

    device: str | None = None

    location: str | None = None

    department: str | None = None


class IssueUpdate(BaseModel):
    status: str | None = None

    priority: str | None = None

    technician_id: str | None = None

    root_cause: str | None = None

    resolution: str | None = None

    time_spent_minutes: int | None = None


class IssueRatingIn(BaseModel):
    rating: int = Field(
        ge=1,
        le=5,
    )

    feedback: str | None = None


class IssueOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: str

    title: str

    description: str

    category: str

    priority: str

    status: str

    device: str | None = None

    location: str | None = None

    department: str | None = None

    created_at: datetime

    updated_at: datetime

    resolved_at: datetime | None = None

    root_cause: str | None = None

    resolution: str | None = None

    employee_rating: int | None = None

    employee_feedback: str | None = None

    has_attachment: bool = False

    employee: IssueEmployeeOut

    technician: IssueTechnicianOut | None = None


class IssueDetailOut(IssueOut):
    timeline: list[TimelineEventOut] = Field(
        default_factory=list
    )

    comments: list[CommentOut] = Field(
        default_factory=list
    )

    attachments: list[AttachmentOut] = Field(
        default_factory=list
    )


class CommentCreate(BaseModel):
    body: str = Field(
        min_length=1,
    )