from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
    Form,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.issue import Issue
from app.models.attachment import IssueAttachment
from app.schemas.attachment import AttachmentOut


router = APIRouter(
    prefix="/issues",
    tags=["attachments"],
)


# ---------------------------------------------------------
# UPLOAD DIRECTORY
# ---------------------------------------------------------

BASE_UPLOAD_DIR = Path("uploads")
UPLOAD_DIR = BASE_UPLOAD_DIR / "issues"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _serialize_attachment(
    attachment: IssueAttachment,
) -> dict:
    """
    Convert an IssueAttachment database object into the
    response expected by the frontend.

    The actual file is never exposed as a filesystem path.
    The frontend receives an API URL instead.
    """

    return {
        "id": attachment.id,
        "issue_id": attachment.issue_id,
        "uploaded_by": attachment.uploaded_by,
        "original_filename": attachment.original_filename,
        "stored_filename": attachment.stored_filename,
        "file_path": attachment.file_path,
        "content_type": attachment.content_type,
        "file_size": attachment.file_size,
        "attachment_type": attachment.attachment_type,
        "created_at": attachment.created_at,
        "url": f"/api/v1/issues/attachments/{attachment.id}/file",
    }


def _can_access_issue(
    user: User,
    issue: Issue,
) -> bool:
    """
    Employees can access their own issue attachments.

    Technicians and administrators can access attachments
    belonging to issues they are allowed to work with.
    """

    role = getattr(user.role, "value", user.role)

    if role == UserRole.EMPLOYEE.value:
        return issue.employee_id == user.id

    if role in {
        UserRole.TECHNICIAN.value,
        UserRole.ADMIN.value,
    }:
        return True

    return False


# ---------------------------------------------------------
# LIST ISSUE ATTACHMENTS
# ---------------------------------------------------------

@router.get(
    "/{issue_id}/attachments",
    response_model=list[AttachmentOut],
)
def list_attachments(
    issue_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Return every attachment belonging to an issue.
    """

    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    if not _can_access_issue(user, issue):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access attachments for this issue",
        )

    attachments = (
        db.query(IssueAttachment)
        .filter(
            IssueAttachment.issue_id == issue_id
        )
        .order_by(
            IssueAttachment.created_at.asc()
        )
        .all()
    )

    return [
        _serialize_attachment(attachment)
        for attachment in attachments
    ]


# ---------------------------------------------------------
# UPLOAD ATTACHMENT
# ---------------------------------------------------------

@router.post(
    "/{issue_id}/attachments",
    response_model=AttachmentOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_attachment(
    issue_id: str,
    file: UploadFile = File(...),
    attachment_type: str = Form("file"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Upload an attachment to an existing issue.
    """

    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    # -----------------------------------------------------
    # AUTHORIZATION
    # -----------------------------------------------------

    if not _can_access_issue(user, issue):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot upload an attachment to this issue",
        )

    # -----------------------------------------------------
    # VALIDATE FILE
    # -----------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required",
        )

    # -----------------------------------------------------
    # NORMALIZE ATTACHMENT TYPE
    # -----------------------------------------------------

    attachment_type = (
        attachment_type.strip().lower()
        if attachment_type
        else "file"
    )

    if attachment_type not in {
        "file",
        "screenshot",
    }:
        attachment_type = "file"

    # -----------------------------------------------------
    # SAFE FILE NAME
    # -----------------------------------------------------

    original_filename = Path(
        file.filename
    ).name

    extension = Path(
        original_filename
    ).suffix

    stored_filename = (
        f"{uuid4().hex}{extension}"
    )

    issue_upload_dir = (
        UPLOAD_DIR / issue_id
    )

    issue_upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = (
        issue_upload_dir /
        stored_filename
    )

    # -----------------------------------------------------
    # SAVE FILE
    # -----------------------------------------------------

    file_size = 0

    try:
        with file_path.open("wb") as buffer:

            while True:
                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                buffer.write(chunk)
                file_size += len(chunk)

    except Exception as exc:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save attachment",
        ) from exc

    finally:
        await file.close()

    # -----------------------------------------------------
    # DATABASE RECORD
    # -----------------------------------------------------

    attachment = IssueAttachment(
        issue_id=issue.id,
        uploaded_by=user.id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=str(file_path),
        content_type=file.content_type,
        file_size=file_size,
        attachment_type=attachment_type,
    )

    db.add(attachment)

    issue.has_attachment = True

    try:
        db.commit()
        db.refresh(attachment)

    except Exception as exc:

        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save attachment record",
        ) from exc

    return _serialize_attachment(attachment)


# ---------------------------------------------------------
# SERVE / VIEW ATTACHMENT
# ---------------------------------------------------------

@router.get(
    "/attachments/{attachment_id}/file",
)
def get_attachment_file(
    attachment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Return the actual attachment file.

    This endpoint is what allows the technician frontend
    to display images and allows files to be opened/downloaded.
    """

    attachment = db.get(
        IssueAttachment,
        attachment_id,
    )

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )

    issue = db.get(
        Issue,
        attachment.issue_id,
    )

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    if not _can_access_issue(user, issue):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this attachment",
        )

    file_path = Path(
        attachment.file_path
    )

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment file is missing from the server",
        )

    return FileResponse(
        path=file_path,
        media_type=attachment.content_type
        or "application/octet-stream",
        filename=attachment.original_filename,
        content_disposition_type="attachment",
    )


# ---------------------------------------------------------
# DELETE ATTACHMENT
# ---------------------------------------------------------

@router.delete(
    "/attachments/{attachment_id}",
)
def delete_attachment(
    attachment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Delete an attachment.

    Only technicians/admins can delete attachments.
    """

    attachment = db.get(
        IssueAttachment,
        attachment_id,
    )

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )

    issue = db.get(
        Issue,
        attachment.issue_id,
    )

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    role = getattr(
        user.role,
        "value",
        user.role,
    )

    if role not in {
        UserRole.TECHNICIAN.value,
        UserRole.ADMIN.value,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians and administrators can delete attachments",
        )

    file_path = Path(
        attachment.file_path
    )

    if file_path.exists():
        file_path.unlink()

    db.delete(attachment)

    # Check whether other attachments still exist.
    remaining = (
        db.query(IssueAttachment)
        .filter(
            IssueAttachment.issue_id == issue.id,
            IssueAttachment.id != attachment.id,
        )
        .count()
    )

    issue.has_attachment = remaining > 0

    db.commit()

    return {
        "ok": True,
        "id": attachment_id,
    }