from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.crud import settings as settings_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.settings import (
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    DepartmentCreate,
    DepartmentOut,
    DepartmentUpdate,
    SLARuleCreate,
    SLARuleOut,
    SLARuleUpdate,
)

router = APIRouter(prefix="/settings", tags=["settings"])


# --- SLA Rules Endpoints ---
@router.get("/sla-rules", response_model=list[SLARuleOut])
def get_sla_rules(db: Session = Depends(get_db)):
    return settings_crud.list_sla_rules(db)


@router.post("/sla-rules", response_model=SLARuleOut, status_code=status.HTTP_201_CREATED)
def create_sla_rule(
    payload: SLARuleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return settings_crud.create_sla_rule(db, payload)


@router.put("/sla-rules/{rule_id}", response_model=SLARuleOut)
def update_sla_rule(
    rule_id: str,
    payload: SLARuleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return settings_crud.update_sla_rule(db, rule_id, payload)


@router.delete("/sla-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sla_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    settings_crud.delete_sla_rule(db, rule_id)
    return None


# --- Issue Categories Endpoints ---
@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return settings_crud.list_categories(db)


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return settings_crud.create_category(db, payload)


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return settings_crud.update_category(db, category_id, payload)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    settings_crud.delete_category(db, category_id)
    return None


# --- Departments Endpoints ---
@router.get("/departments", response_model=list[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return settings_crud.list_departments(db)


@router.post("/departments", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return settings_crud.create_department(db, payload)


@router.put("/departments/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: str,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return settings_crud.update_department(db, dept_id, payload)


@router.delete("/departments/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    dept_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    settings_crud.delete_department(db, dept_id)
    return None
