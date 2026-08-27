from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.db.session import get_db
from app.crud import user as user_crud
from app.models.user import User
from app.schemas.user import UserOut, EmployeeSummary, TechnicianSummary, UserUpdate, EmployeeCreate

router = APIRouter(tags=["users"])


@router.get("/users/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.get("/employees", response_model=list[EmployeeSummary])
def list_employees(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    result = []
    for e in user_crud.list_employees(db):
        open_c, resolved_c = user_crud.issue_counts_for(db, e.id)
        result.append(
            EmployeeSummary(
                **UserOut.model_validate(e).model_dump(),
                open_issues=open_c,
                resolved_issues=resolved_c,
                last_activity=e.created_at.isoformat() if e.created_at else None,
            )
        )
    return result


@router.post("/employees", response_model=UserOut, status_code=201)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_crud.create_employee(db, payload)


@router.patch("/employees/{user_id}", response_model=UserOut)
def update_employee(user_id: str, payload: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    target = db.get(User, user_id)
    if not target:
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(target, field, value)
    db.commit()
    db.refresh(target)
    return target


@router.delete("/employees/{user_id}", response_model=UserOut)
def delete_employee(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return user_crud.delete_employee(db, user_id)



@router.get("/technicians", response_model=list[TechnicianSummary])
def list_technicians(
    days: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = []
    for t in user_crud.list_technicians(db):
        open_c, _ = user_crud.technician_load(db, t.id)
        perf = user_crud.get_technician_performance(db, t.id, days=days)
        result.append(
            TechnicianSummary(
                **UserOut.model_validate(t).model_dump(
                    exclude={"rating", "sla_success_rate"}
                ),
                open_issues=open_c,
                solved_issues=perf["solved_issues"],
                avg_resolution=perf["avg_resolution"],
                avg_response=perf["avg_response"],
                rating=perf["rating"],
                sla_success_rate=perf["sla"],
            )
        )
    return result