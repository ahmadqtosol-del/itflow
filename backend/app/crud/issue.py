from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.issue import (
    Issue,
    IssueStatus,
    IssuePriority,
    IssueTimelineEvent,
    IssueComment,
)
from app.models.user import User, UserRole


def generate_issue_id(
    db: Session,
) -> str:
    count = db.query(
        func.count(Issue.id)
    ).scalar() or 0

    candidate = f"IT-{100 + count + 1}"

    # Guard against rare collisions after manual seeding
    while db.get(Issue, candidate):
        count += 1
        candidate = f"IT-{100 + count + 1}"

    return candidate


def list_issues(
    db: Session,
    *,
    employee_id: str | None = None,
    technician_id: str | None = None,
    unassigned_or_technician_id: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    statuses: list[str] | None = None,
) -> list[Issue]:

    q = db.query(Issue)

    if employee_id:
        q = q.filter(
            Issue.employee_id == employee_id
        )

    if technician_id:
        q = q.filter(
            Issue.technician_id == technician_id
        )
    elif unassigned_or_technician_id:
        q = q.filter(
            (Issue.technician_id == unassigned_or_technician_id)
            | (Issue.technician_id.is_(None))
        )

    if status:
        q = q.filter(
            Issue.status == status
        )

    if statuses:
        q = q.filter(
            Issue.status.in_(statuses)
        )

    if priority:
        q = q.filter(
            Issue.priority == priority
        )

    if search:
        like = f"%{search.lower()}%"

        q = q.filter(
            func.lower(
                Issue.title + " " + Issue.id
            ).like(like)
        )

    return (
        q
        .order_by(Issue.created_at.desc())
        .all()
    )


def get_issue(
    db: Session,
    issue_id: str,
) -> Issue | None:
    return db.get(
        Issue,
        issue_id,
    )


def get_it_technicians(
    db: Session,
) -> list[User]:
    """
    Return all IT technicians.
    """

    return (
        db.query(User)
        .filter(
            User.role == UserRole.TECHNICIAN,
            User.department == "IT",
        )
        .all()
    )


def create_issue(
    db: Session,
    *,
    employee: User,
    data,
) -> Issue:

    issue = Issue(
        id=generate_issue_id(db),
        title=data.title,
        description=data.description,
        category=data.category,
        priority=IssuePriority(data.priority),
        status=IssueStatus.NEW,
        employee_id=employee.id,
        device=data.device,
        location=data.location,
    )

    db.add(issue)

    db.flush()

    db.add(
        IssueTimelineEvent(
            issue_id=issue.id,
            label="Issue created",
        )
    )

    db.commit()
    db.refresh(issue)

    return issue


def update_issue(
    db: Session,
    *,
    issue: Issue,
    data,
    acting_user: User,          # <-- NEW
) -> Issue:

    events: list[str] = []

    # ---------------------------------------------------------
    # AUTO-ASSIGN ACTING TECHNICIAN
    #
    # If a technician is the one making the change (status,
    # resolution, etc.) and the issue currently has nobody
    # assigned, attribute it to them. This does NOT run for
    # admins, and does NOT override an existing technician —
    # so explicit reassignment below still works normally.
    # ---------------------------------------------------------

    if (
        acting_user.role == UserRole.TECHNICIAN
        and issue.technician_id is None
    ):
        issue.technician_id = acting_user.id

        if issue.status == IssueStatus.NEW:
            issue.status = IssueStatus.ASSIGNED

        if issue.responded_at is None:
            issue.responded_at = datetime.now(timezone.utc)

        events.append(f"Assigned to {acting_user.name}")

    # ---------------------------------------------------------
    # PRIORITY CHANGE
    # ---------------------------------------------------------
    
    # ---------------------------------------------------------
    # PRIORITY CHANGE
    # ---------------------------------------------------------

    if (
        data.priority
        and data.priority != issue.priority.value
    ):

        issue.priority = IssuePriority(
            data.priority
        )

        events.append(
            f"Priority changed to "
            f"{data.priority.title()}"
        )

    # ---------------------------------------------------------
    # TECHNICIAN ASSIGNMENT
    # ---------------------------------------------------------

    if (
        data.technician_id
        and data.technician_id
        != issue.technician_id
    ):

        tech = db.get(
            User,
            data.technician_id,
        )

        # Technician must exist.
        if not tech:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Technician not found",
            )

        # Prevent assigning employees or admins
        # as issue technicians.
        if tech.role != UserRole.TECHNICIAN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected user is not a technician"
                ),
            )

        issue.technician_id = tech.id

        if issue.status == IssueStatus.NEW:
            issue.status = IssueStatus.ASSIGNED

        if issue.responded_at is None:
            issue.responded_at = datetime.now(
                timezone.utc
            )

        events.append(
            f"Assigned to {tech.name}"
        )

    # ---------------------------------------------------------
    # STATUS CHANGE
    # ---------------------------------------------------------

    if (
        data.status
        and data.status != issue.status.value
    ):

        issue.status = IssueStatus(
            data.status
        )

        label = (
            issue.status.value
            .replace("_", " ")
            .title()
        )

        events.append(
            f"Status changed to {label}"
        )

        if (
            issue.status
            in (
                IssueStatus.RESOLVED,
                IssueStatus.CLOSED,
            )
            and issue.resolved_at is None
        ):

            issue.resolved_at = datetime.now(
                timezone.utc
            )

    # ---------------------------------------------------------
    # ROOT CAUSE
    # ---------------------------------------------------------

    if data.root_cause is not None:
        issue.root_cause = data.root_cause

    # ---------------------------------------------------------
    # RESOLUTION
    # ---------------------------------------------------------

    if data.resolution is not None:
        issue.resolution = data.resolution

    # ---------------------------------------------------------
    # TIME SPENT
    # ---------------------------------------------------------

    if data.time_spent_minutes is not None:
        issue.time_spent_minutes = (
            data.time_spent_minutes
        )

    # ---------------------------------------------------------
    # TIMELINE EVENTS
    # ---------------------------------------------------------

    for label in events:

        db.add(
            IssueTimelineEvent(
                issue_id=issue.id,
                label=label,
            )
        )

    db.commit()
    db.refresh(issue)

    return issue


def rate_issue(
    db: Session,
    *,
    issue: Issue,
    rating: int,
    feedback: str | None,
) -> Issue:

    issue.employee_rating = rating
    issue.employee_feedback = feedback

    db.commit()
    db.refresh(issue)

    return issue


def add_comment(
    db: Session,
    *,
    issue: Issue,
    author: User,
    body: str,
) -> IssueComment:

    comment = IssueComment(
        issue_id=issue.id,
        author_id=author.id,
        body=body,
    )

    db.add(comment)

    db.commit()
    db.refresh(comment)

    return comment