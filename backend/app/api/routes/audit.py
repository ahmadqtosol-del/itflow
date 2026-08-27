from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.session import get_db
from app.models.notification import AuditLog
from app.models.user import User
from app.schemas.notification import AuditLogOut

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(category: str | None = None, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    q = db.query(AuditLog)
    if category:
        q = q.filter(AuditLog.category == category)
    return q.order_by(AuditLog.created_at.desc()).limit(200).all()
