from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str
    role: str
    department: str | None = None
    avatar_color: str
    status: str
    specialization: str | None = None
    rating: float | None = None
    sla_success_rate: float | None = None
    created_at: datetime | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    department: str | None = None
    role: str | None = None
    status: str | None = None
    specialization: str | None = None


class EmployeeCreate(BaseModel):
    name: str
    email: str
    password: str  # plain text — hashed in CRUD before storing
    department: str | None = None
    role: str = "EMPLOYEE"
    status: str = "Active"
    avatar_color: str | None = "#3b82f6"


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: "UserOut"



class EmployeeSummary(UserOut):
    open_issues: int = 0
    resolved_issues: int = 0
    last_activity: str | None = None


class TechnicianSummary(UserOut):
    open_issues: int = 0
    solved_issues: int = 0
    avg_resolution: str | None = None
    avg_response: str | None = None
    rating: float | None = 0
    sla_success_rate: float | None = 0