from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.issue import Issue, IssueStatus
from app.models.user import User, UserRole


def list_employees(db: Session) -> list[User]:
    return db.query(User).filter(User.role == UserRole.EMPLOYEE).order_by(User.name).all()


def list_technicians(db: Session) -> list[User]:
    return db.query(User).filter(User.role == UserRole.TECHNICIAN).order_by(User.name).all()


def issue_counts_for(db: Session, user_id: str) -> tuple[int, int]:
    open_count = (
        db.query(func.count(Issue.id))
        .filter(Issue.employee_id == user_id, Issue.status.notin_([IssueStatus.RESOLVED, IssueStatus.CLOSED]))
        .scalar()
        or 0
    )
    resolved_count = (
        db.query(func.count(Issue.id))
        .filter(Issue.employee_id == user_id, Issue.status.in_([IssueStatus.RESOLVED, IssueStatus.CLOSED]))
        .scalar()
        or 0
    )
    return open_count, resolved_count


def technician_load(db: Session, tech_id: str) -> tuple[int, int]:
    open_count = (
        db.query(func.count(Issue.id))
        .filter(Issue.technician_id == tech_id, Issue.status.notin_([IssueStatus.RESOLVED, IssueStatus.CLOSED]))
        .scalar()
        or 0
    )
    solved_count = (
        db.query(func.count(Issue.id))
        .filter(Issue.technician_id == tech_id, Issue.status.in_([IssueStatus.RESOLVED, IssueStatus.CLOSED]))
        .scalar()
        or 0
    )
    return open_count, solved_count


SLA_RESOLUTION_MINUTES = {
    "CRITICAL": 30,
    "HIGH": 120,
    "MEDIUM": 480,
    "LOW": 1440,
}


def format_minutes(minutes: float | None) -> str:
    if minutes is None or minutes <= 0:
        return "0m"
    total_mins = int(round(minutes))
    hours = total_mins // 60
    mins = total_mins % 60
    if hours > 0:
        return f"{hours}h {mins}m" if mins > 0 else f"{hours}h"
    return f"{mins}m"


def get_technician_performance(db: Session, tech_id: str, days: int | None = None) -> dict:
    from datetime import datetime, timedelta, timezone

    q = db.query(Issue).filter(Issue.technician_id == tech_id)

    if days:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        q = q.filter((Issue.created_at >= since) | (Issue.resolved_at >= since))

    issues = q.all()

    solved = [i for i in issues if i.status in (IssueStatus.RESOLVED, IssueStatus.CLOSED)]
    solved_count = len(solved)

    resolution_times = [
        (i.resolved_at - i.created_at).total_seconds() / 60
        for i in solved
        if i.created_at and i.resolved_at
    ]
    avg_resolution_mins = (sum(resolution_times) / len(resolution_times)) if resolution_times else 0.0

    responded_issues = [
        (i.responded_at - i.created_at).total_seconds() / 60
        for i in issues
        if i.created_at and i.responded_at
    ]
    avg_response_mins = (sum(responded_issues) / len(responded_issues)) if responded_issues else 0.0

    ratings = [i.employee_rating for i in solved if i.employee_rating is not None]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

    if solved:
        met_sla = sum(
            1
            for i in solved
            if i.created_at
            and i.resolved_at
            and ((i.resolved_at - i.created_at).total_seconds() / 60)
            <= SLA_RESOLUTION_MINUTES.get(
                i.priority.value if hasattr(i.priority, "value") else str(i.priority), 480
            )
        )
        sla_rate = round((met_sla / len(solved)) * 100, 1)
    else:
        sla_rate = 0.0

    return {
        "solved_issues": solved_count,
        "avg_resolution": format_minutes(avg_resolution_mins),
        "avg_resolution_mins": round(avg_resolution_mins, 1),
        "avg_response": format_minutes(avg_response_mins),
        "avg_response_mins": round(avg_response_mins, 1),
        "rating": avg_rating,
        "sla": sla_rate,
    }


def create_employee(db: Session, data) -> User:
    from fastapi import HTTPException, status
    from app.core.security import hash_password
    from app.models.user import UserStatus

    existing = db.query(User).filter(User.email.ilike(data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{data.email}' already exists.",
        )
    role_val = UserRole[data.role.upper()] if hasattr(UserRole, data.role.upper()) else UserRole.EMPLOYEE
    # Hash the password before persisting — never store plain text
    pw_hash = hash_password(data.password) if getattr(data, "password", None) else None
    user = User(
        name=data.name,
        email=data.email,
        department=data.department,
        role=role_val,
        status=data.status or UserStatus.ACTIVE.value,
        avatar_color=data.avatar_color or "#3b82f6",
        password_hash=pw_hash,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_employee(db: Session, user_id: str) -> User:
    from fastapi import HTTPException, status
    from app.models.user import UserStatus

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Check if employee has existing reported or assigned issues
    issues_count = db.query(Issue).filter((Issue.employee_id == user_id) | (Issue.technician_id == user_id)).count()
    if issues_count > 0:
        # Soft delete / disable status to maintain historical issues integrity
        user.status = UserStatus.DISABLED.value
        db.commit()
        db.refresh(user)
        return user
    else:
        # If no dependent issues exist, hard delete
        db.delete(user)
        db.commit()
        return user

