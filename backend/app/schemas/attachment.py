from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AttachmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    issue_id: str
    uploaded_by: str

    original_filename: str
    stored_filename: str
    file_path: str

    content_type: str | None = None
    file_size: int
    attachment_type: str

    created_at: datetime

    # Frontend uses this URL to display/download the attachment.
    url: str | None = None