from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.attachment import AttachmentOut
from app.core.security import (
    get_current_user,
    require_technician_or_admin,
)
from app.db.session import get_db
from app.crud import issue as issue_crud
from app.crud import notification as notification_crud
from app.models.issue import IssueStatus
from app.models.user import User, UserRole
from app.schemas.issue import (
    IssueOut,
    IssueDetailOut,
    IssueCreate,
    IssueUpdate,
    IssueRatingIn,
    CommentCreate,
    CommentOut,
)
from app.services import email_service
from app.services.ws_manager import manager


router = APIRouter(
    prefix="/issues",
    tags=["issues"],
)


def _serialize_comment(c) -> CommentOut:
    return CommentOut(
        id=c.id,
        body=c.body,
        created_at=c.created_at,
        author_id=c.author_id,
        author_name=c.author.name if c.author else None,
    )


@router.get("", response_model=list[IssueOut])
def list_issues(
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    mine: bool = False,
    technician_id: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Employees always get their own issues.

    Technicians get issues assigned to them / technician work queue,
    unless the `mine` flag is explicitly used to see issues they submitted.

    Administrators view all issues.
    """

    employee_id = None
    target_technician_id = technician_id
    unassigned_or_tech_id = None

    if user.role == UserRole.EMPLOYEE or mine:
        employee_id = user.id
    elif user.role == UserRole.TECHNICIAN:
        if not target_technician_id:
            unassigned_or_tech_id = user.id

    return issue_crud.list_issues(
        db,
        employee_id=employee_id,
        technician_id=target_technician_id,
        unassigned_or_technician_id=unassigned_or_tech_id,
        status=status,
        priority=priority,
        search=search,
    )


@router.get(
    "/{issue_id}",
    response_model=IssueDetailOut,
)
def get_issue(
    issue_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    issue = issue_crud.get_issue(
        db,
        issue_id,
    )

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    # Employees can only view their own issues.
    if (
        user.role == UserRole.EMPLOYEE
        and issue.employee_id != user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not your issue",
        )

    out = IssueDetailOut.model_validate(issue)

    # ---------------------------------------------------------
    # COMMENTS
    # ---------------------------------------------------------

    out.comments = [
        _serialize_comment(comment)
        for comment in issue.comments
    ]

    # ---------------------------------------------------------
    # ATTACHMENTS
    # ---------------------------------------------------------

    out.attachments = [
        AttachmentOut(
            id=attachment.id,
            issue_id=attachment.issue_id,
            uploaded_by=attachment.uploaded_by,
            original_filename=attachment.original_filename,
            stored_filename=attachment.stored_filename,
            file_path=attachment.file_path,
            content_type=attachment.content_type,
            file_size=attachment.file_size,
            attachment_type=attachment.attachment_type,
            created_at=attachment.created_at,
            url=f"/api/v1/issues/attachments/{attachment.id}/file",
        )
        for attachment in issue.attachments
    ]

    return out


# =============================================================
# CREATE ISSUE
# EMPLOYEES ONLY
# =============================================================

@router.post(
    "",
    response_model=IssueOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_issue(
    payload: IssueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Employees, Technicians, and Admins are allowed to create support issues.
    if user.role not in (UserRole.EMPLOYEE, UserRole.TECHNICIAN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees, technicians, and admins can create issues",
        )

    # ---------------------------------------------------------
    # 1. CREATE ISSUE
    # ---------------------------------------------------------

    issue = issue_crud.create_issue(
        db,
        employee=user,
        data=payload,
    )

    # ---------------------------------------------------------
    # 2. NOTIFICATION FOR THE EMPLOYEE
    # ---------------------------------------------------------

    notification_crud.create_notification(
        db,
        user_id=user.id,
        category="Issues",
        title=f"Your issue {issue.id} was submitted.",
        related_issue_id=issue.id,
    )

    email_service.send_issue_created_email(
        user.email,
        issue.id,
        issue.title,
    )

    # ---------------------------------------------------------
    # 3. EMAIL ALL IT TECHNICIANS
    # ---------------------------------------------------------

    it_technicians = (
        db.query(User)
        .filter(
            User.role == UserRole.TECHNICIAN,
            User.department == "IT",
        )
        .all()
    )

    for technician in it_technicians:

        notification_crud.create_notification(
            db,
            user_id=technician.id,
            category="Issues",
            title=(
                f"New issue {issue.id} "
                "requires attention."
            ),
            related_issue_id=issue.id,
        )

        email_service.send_new_issue_to_technician(
            technician_email=technician.email,
            issue_id=issue.id,
            issue_title=issue.title,
            employee_name=user.name,
            employee_email=user.email,
            department=(
                issue.employee.department
                if (
                    issue.employee
                    and issue.employee.department
                )
                else payload.department or "Not specified"
            ),
            priority=(
                issue.priority.value
                if hasattr(issue.priority, "value")
                else str(issue.priority)
            ),
            category=issue.category,
            description=issue.description,
            submitted_at=issue.created_at,
        )

    # ---------------------------------------------------------
    # 4. CRITICAL ISSUE → NOTIFY ALL ADMINS
    # ---------------------------------------------------------

    if issue.priority.value == "CRITICAL":

        admins = (
            db.query(User)
            .filter(
                User.role == UserRole.ADMIN,
            )
            .all()
        )

        for admin in admins:

            notification_crud.create_notification(
                db,
                user_id=admin.id,
                category="System",
                title=(
                    f"Critical issue {issue.id} "
                    "requires attention."
                ),
                related_issue_id=issue.id,
            )

            email_service.send_critical_issue_alert_email(
                admin.email,
                issue.id,
                issue.title,
            )

    # ---------------------------------------------------------
    # 5. REAL-TIME WEBSOCKET UPDATE
    # ---------------------------------------------------------

    await manager.broadcast(
        "ISSUE_CREATED",
        {
            "id": issue.id,
            "status": issue.status.value,
        },
    )

    return issue


# =============================================================
# UPDATE ISSUE
# TECHNICIAN OR ADMIN ONLY
# =============================================================

@router.patch(
    "/{issue_id}",
    response_model=IssueOut,
)
async def update_issue(
    issue_id: str,
    payload: IssueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_technician_or_admin),
):
    """
    Update an issue.

    Only technicians and administrators can modify
    technician-side issue data such as status and assignment.

    Status flow is persisted in the database and the
    updated Issue object is returned to the frontend.
    """

    issue = issue_crud.get_issue(
        db,
        issue_id,
    )

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    previous_status = issue.status
    previous_technician_id = issue.technician_id

    issue = issue_crud.update_issue(
    db,
    issue=issue,
    data=payload,
    acting_user=user,          # <-- NEW
)

    # ---------------------------------------------------------
    # TECHNICIAN ASSIGNED
    # ---------------------------------------------------------

    if (
        issue.technician_id
        and issue.technician_id
        != previous_technician_id
    ):
        tech = db.get(
            User,
            issue.technician_id,
        )

        if tech:
            notification_crud.create_notification(
                db,
                user_id=issue.employee_id,
                category="Issues",
                title=(
                    f"{issue.id} was assigned "
                    f"to {tech.name}."
                ),
                related_issue_id=issue.id,
            )

            email_service.send_issue_assigned_email(
                issue.employee.email,
                issue.id,
                issue.title,
                tech.name,
            )

            await manager.broadcast(
                "ISSUE_ASSIGNED",
                {
                    "id": issue.id,
                    "technician_id": tech.id,
                },
            )

    # ---------------------------------------------------------
    # STATUS CHANGED
    # ---------------------------------------------------------

    if issue.status != previous_status:
        label = (
            issue.status.value
            .replace("_", " ")
            .title()
        )

        notification_crud.create_notification(
            db,
            user_id=issue.employee_id,
            category="Issues",
            title=(
                f"Your issue {issue.id} "
                f"has been {label.lower()}."
            ),
            related_issue_id=issue.id,
        )

        if issue.status in (
            IssueStatus.RESOLVED,
            IssueStatus.CLOSED,
        ):
            email_service.send_issue_resolved_email(
                issue.employee.email,
                issue.id,
                issue.title,
                issue.resolution,
            )
        else:
            email_service.send_issue_status_changed_email(
                issue.employee.email,
                issue.id,
                issue.title,
                label,
            )

        await manager.broadcast(
            "ISSUE_UPDATED",
            {
                "id": issue.id,
                "status": issue.status.value,
            },
        )

 
    return issue

@router.post(
    "/{issue_id}/rate",
    response_model=IssueOut,
)
def rate_issue(
    issue_id: str,
    payload: IssueRatingIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    issue = issue_crud.get_issue(
        db,
        issue_id,
    )

    if (
        not issue
        or issue.employee_id != user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    return issue_crud.rate_issue(
        db,
        issue=issue,
        rating=payload.rating,
        feedback=payload.feedback,
    )


@router.post(
    "/{issue_id}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_comment(
    issue_id: str,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    issue = issue_crud.get_issue(
        db,
        issue_id,
    )

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    # Employees can only comment on their own issues.
    if (
        user.role == UserRole.EMPLOYEE
        and issue.employee_id != user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not your issue",
        )

    comment = issue_crud.add_comment(
        db,
        issue=issue,
        author=user,
        body=payload.body,
    )

    # ---------------------------------------------------------
    # DETERMINE MESSAGE RECIPIENT
    # ---------------------------------------------------------

    recipient = (
        issue.technician
        if user.id == issue.employee_id
        else issue.employee
    )

    if recipient:

        notification_crud.create_notification(
            db,
            user_id=recipient.id,
            category="Messages",
            title=(
                f"New message on {issue.id} "
                f"from {user.name}."
            ),
            related_issue_id=issue.id,
        )

        email_service.send_new_message_email(
            recipient.email,
            issue.id,
            user.name,
            payload.body[:140],
        )

    # ---------------------------------------------------------
    # REAL-TIME MESSAGE UPDATE
    # ---------------------------------------------------------

    await manager.broadcast(
        "MESSAGE_CREATED",
        {
            "issue_id": issue.id,
            "author_id": user.id,
        },
    )

    return _serialize_comment(comment)