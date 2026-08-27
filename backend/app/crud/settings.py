from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.issue import Issue
from app.models.settings import Category, Department, SLARule
from app.models.user import User
from app.schemas.settings import (
    CategoryCreate,
    CategoryUpdate,
    DepartmentCreate,
    DepartmentUpdate,
    SLARuleCreate,
    SLARuleUpdate,
)


# --- SLA Rules CRUD ---
def list_sla_rules(db: Session) -> list[SLARule]:
    return db.query(SLARule).all()


def get_sla_rule(db: Session, rule_id: str) -> SLARule | None:
    return db.get(SLARule, rule_id)


def create_sla_rule(db: Session, data: SLARuleCreate) -> SLARule:
    existing = db.query(SLARule).filter(SLARule.priority.ilike(data.priority)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SLA Rule for priority '{data.priority}' already exists.",
        )
    rule = SLARule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def update_sla_rule(db: Session, rule_id: str, data: SLARuleUpdate) -> SLARule:
    rule = db.get(SLARule, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="SLA Rule not found"
        )
    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(rule, field, val)
    db.commit()
    db.refresh(rule)
    return rule


def delete_sla_rule(db: Session, rule_id: str) -> None:
    rule = db.get(SLARule, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="SLA Rule not found"
        )
    db.delete(rule)
    db.commit()


# --- Categories CRUD ---
def list_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name).all()


def get_category(db: Session, category_id: str) -> Category | None:
    return db.get(Category, category_id)


def create_category(db: Session, data: CategoryCreate) -> Category:
    existing = db.query(Category).filter(Category.name.ilike(data.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{data.name}' already exists.",
        )
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, category_id: str, data: CategoryUpdate) -> Category:
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )

    old_name = cat.name
    new_name = data.name

    if new_name and new_name.lower() != old_name.lower():
        existing = db.query(Category).filter(Category.name.ilike(new_name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{new_name}' already exists.",
            )
        # Update existing issues referencing old_name to new_name so relationships remain intact
        issues = db.query(Issue).filter(Issue.category == old_name).all()
        for issue in issues:
            issue.category = new_name

    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(cat, field, val)

    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, category_id: str) -> None:
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )

    # Check if category is used by existing issues
    issue_count = db.query(Issue).filter(Issue.category.ilike(cat.name)).count()
    if issue_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{cat.name}' because {issue_count} issue(s) reference it.",
        )

    db.delete(cat)
    db.commit()


# --- Departments CRUD ---
def list_departments(db: Session) -> list[Department]:
    return db.query(Department).order_by(Department.name).all()


def get_department(db: Session, dept_id: str) -> Department | None:
    return db.get(Department, dept_id)


def create_department(db: Session, data: DepartmentCreate) -> Department:
    existing = (
        db.query(Department).filter(Department.name.ilike(data.name)).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department '{data.name}' already exists.",
        )
    dept = Department(**data.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


def update_department(
    db: Session, dept_id: str, data: DepartmentUpdate
) -> Department:
    dept = db.get(Department, dept_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )

    old_name = dept.name
    new_name = data.name

    if new_name and new_name.lower() != old_name.lower():
        existing = (
            db.query(Department).filter(Department.name.ilike(new_name)).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department '{new_name}' already exists.",
            )
        # Update users assigned to old department name
        users = db.query(User).filter(User.department == old_name).all()
        for u in users:
            u.department = new_name

    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(dept, field, val)

    db.commit()
    db.refresh(dept)
    return dept


def delete_department(db: Session, dept_id: str) -> None:
    dept = db.get(Department, dept_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )

    # Safety check: if employees belong to this department, prevent hard deletion
    user_count = db.query(User).filter(User.department.ilike(dept.name)).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete department '{dept.name}' because {user_count} user(s) are assigned to it.",
        )

    db.delete(dept)
    db.commit()
