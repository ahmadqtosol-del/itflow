from pydantic import BaseModel


class AdminSummary(BaseModel):
    total_issues: int
    open: int
    in_progress: int
    critical: int
    resolved_today: int
    avg_resolution_minutes: float


class EmployeeSummary(BaseModel):
    open: int
    in_progress: int
    waiting: int
    resolved: int


class TrendPoint(BaseModel):
    label: str
    created: int
    resolved: int
