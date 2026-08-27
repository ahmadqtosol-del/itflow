from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.db.session import get_db
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.models.user import User
from app.schemas.dashboard import AdminSummary, EmployeeSummary, TrendPoint


def _as_utc(dt):
    """
    Normalize a datetime to timezone-aware UTC.

    SQLite does not persist tzinfo even on a
    DateTime(timezone=True) column, so values read
    back from the ORM can be naive. Comparing a naive
    and an aware datetime raises TypeError, which is
    what was crashing /dashboard/performance.
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt



router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


APP_TIMEZONE = ZoneInfo("Asia/Karachi")


@router.get(
    "/admin-summary",
    response_model=AdminSummary,
)
def admin_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Return dashboard statistics for administrators.
    """

    # ---------------------------------------------------------
    # Total issues
    # ---------------------------------------------------------
    total = (
        db.query(func.count(Issue.id))
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # Open issues
    #
    # Resolved and closed issues are not considered open.
    # ---------------------------------------------------------
    open_count = (
        db.query(func.count(Issue.id))
        .filter(
            Issue.status.notin_(
                [
                    IssueStatus.RESOLVED,
                    IssueStatus.CLOSED,
                ]
            )
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # In-progress issues
    # ---------------------------------------------------------
    in_progress = (
        db.query(func.count(Issue.id))
        .filter(
            Issue.status == IssueStatus.IN_PROGRESS
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # Critical unresolved issues
    # ---------------------------------------------------------
    critical = (
        db.query(func.count(Issue.id))
        .filter(
            Issue.priority == IssuePriority.CRITICAL,
            Issue.status.notin_(
                [
                    IssueStatus.RESOLVED,
                    IssueStatus.CLOSED,
                ]
            ),
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # Resolved today
    #
    # IMPORTANT:
    # Use the application's configured timezone rather than
    # UTC so "today" matches Pakistan local time.
    # ---------------------------------------------------------
    today = datetime.now(APP_TIMEZONE).date()

    resolved_today = (
        db.query(func.count(Issue.id))
        .filter(
            Issue.resolved_at.isnot(None),
            func.date(Issue.resolved_at) == today,
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # Average resolution time
    #
    # Only issues that actually have a resolved_at timestamp
    # are included.
    # ---------------------------------------------------------
    resolved = (
        db.query(Issue)
        .filter(
            Issue.resolved_at.isnot(None)
        )
        .all()
    )

    if resolved:
        total_minutes = sum(
            (
                issue.resolved_at - issue.created_at
            ).total_seconds()
            / 60
            for issue in resolved
            if issue.created_at is not None
            and issue.resolved_at is not None
        )

        resolved_with_dates = [
            issue
            for issue in resolved
            if issue.created_at is not None
            and issue.resolved_at is not None
        ]

        if resolved_with_dates:
            avg_minutes = (
                total_minutes
                / len(resolved_with_dates)
            )
        else:
            avg_minutes = 0.0
    else:
        avg_minutes = 0.0

    # ---------------------------------------------------------
    # Return dashboard summary
    # ---------------------------------------------------------
    return AdminSummary(
        total_issues=total,
        open=open_count,
        in_progress=in_progress,
        critical=critical,
        resolved_today=resolved_today,
        avg_resolution_minutes=round(
            avg_minutes,
            1,
        ),
    )


@router.get(
    "/employee-summary",
    response_model=EmployeeSummary,
)
def employee_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Return issue statistics for the currently logged-in employee.
    """

    mine = (
        db.query(Issue)
        .filter(
            Issue.employee_id == user.id
        )
        .all()
    )

    return EmployeeSummary(
        open=len(
            [
                issue
                for issue in mine
                if issue.status
                in (
                    IssueStatus.NEW,
                    IssueStatus.QUEUED,
                )
            ]
        ),
        in_progress=len(
            [
                issue
                for issue in mine
                if issue.status
                in (
                    IssueStatus.ASSIGNED,
                    IssueStatus.IN_PROGRESS,
                )
            ]
        ),
        waiting=len(
            [
                issue
                for issue in mine
                if issue.status == IssueStatus.WAITING
            ]
        ),
        resolved=len(
            [
                issue
                for issue in mine
                if issue.status
                in (
                    IssueStatus.RESOLVED,
                    IssueStatus.CLOSED,
                )
            ]
        ),
    )


@router.get(
    "/trend",
    response_model=list[TrendPoint],
)
def issue_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Return created/resolved issue counts for the requested
    number of days.
    """

    # Prevent invalid or excessively large requests.
    days = max(1, min(days, 365))

    since = (
        datetime.now(timezone.utc)
        - timedelta(days=days)
    )

    points: list[TrendPoint] = []

    for offset in range(days):
        day = (
            since
            + timedelta(days=offset)
        ).date()

        created = (
            db.query(func.count(Issue.id))
            .filter(
                func.date(Issue.created_at) == day
            )
            .scalar()
            or 0
        )

        resolved = (
            db.query(func.count(Issue.id))
            .filter(
                func.date(Issue.resolved_at) == day
            )
            .scalar()
            or 0
        )

        points.append(
            TrendPoint(
                label=day.strftime("%a"),
                created=created,
                resolved=resolved,
            )
        )

    return points


@router.get("/performance")
def get_performance(
    days: int = 30,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Return global performance statistics and chart datasets computed
    from actual database records.
    """
    from app.crud import user as user_crud

    days = max(1, min(days, 365))
    since = datetime.now(timezone.utc) - timedelta(days=days)

    q = db.query(Issue).filter(Issue.technician_id.isnot(None))
    if days:
        q = q.filter((Issue.created_at >= since) | (Issue.resolved_at >= since))

    issues = q.all()

    solved_issues = [i for i in issues if i.status in (IssueStatus.RESOLVED, IssueStatus.CLOSED)]
    tasks_solved = len(solved_issues)

    res_mins = [
        (i.resolved_at - i.created_at).total_seconds() / 60
        for i in solved_issues
        if i.created_at and i.resolved_at
    ]
    avg_resolution_mins = (sum(res_mins) / len(res_mins)) if res_mins else 0.0

    resp_mins = [
        (i.responded_at - i.created_at).total_seconds() / 60
        for i in issues
        if i.created_at and i.responded_at
    ]
    avg_response_mins = (sum(resp_mins) / len(resp_mins)) if resp_mins else 0.0

    ratings = [i.employee_rating for i in solved_issues if i.employee_rating is not None]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

    if solved_issues:
        met_sla = sum(
            1
            for i in solved_issues
            if i.created_at
            and i.resolved_at
            and ((i.resolved_at - i.created_at).total_seconds() / 60)
            <= user_crud.SLA_RESOLUTION_MINUTES.get(
                i.priority.value if hasattr(i.priority, "value") else str(i.priority), 480
            )
        )
        sla_success = round((met_sla / len(solved_issues)) * 100, 1)
    else:
        sla_success = 0.0

    techs = user_crud.list_technicians(db)

    resolution_by_tech = []
    for t in techs:
        perf = user_crud.get_technician_performance(db, t.id, days=days)
        resolution_by_tech.append({
            "name": t.name,
            "minutes": round(perf["avg_resolution_mins"]),
        })

    satisfaction_trend = []
    for m_offset in range(5, -1, -1):
        target_month = (datetime.now(timezone.utc) - timedelta(days=m_offset * 30))
        m_start = datetime(target_month.year, target_month.month, 1, tzinfo=timezone.utc)
        if target_month.month == 12:
            m_end = datetime(target_month.year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            m_end = datetime(target_month.year, target_month.month + 1, 1, tzinfo=timezone.utc)

        m_ratings = [
            i.employee_rating
            for i in solved_issues
            if i.employee_rating is not None
            and i.resolved_at
            and m_start <= _as_utc(i.resolved_at) < m_end
        ]
        m_avg = round(sum(m_ratings) / len(m_ratings), 1) if m_ratings else 0.0
        satisfaction_trend.append({
            "month": m_start.strftime("%b"),
            "rating": m_avg,
        })

    cat_counts = {}
    for i in issues:
        cat = i.category or "General"
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    category_breakdown = [
        {"name": cat, "value": count}
        for cat, count in cat_counts.items()
    ]

    return {
        "stats": {
            "tasks_solved": tasks_solved,
            "avg_response": user_crud.format_minutes(avg_response_mins),
            "avg_resolution": user_crud.format_minutes(avg_resolution_mins),
            "avg_rating": avg_rating,
            "sla_success": sla_success,
        },
        "charts": {
            "resolutionByTech": resolution_by_tech,
            "satisfactionTrend": satisfaction_trend,
            "categoryBreakdown": category_breakdown,
        },
    }