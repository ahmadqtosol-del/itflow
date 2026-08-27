from sqlalchemy.orm import Session

from app.models.notification import Notification, AuditLog


def create_notification(db: Session, *, user_id: str, category: str, title: str, related_issue_id: str | None = None) -> Notification:
    n = Notification(user_id=user_id, category=category, title=title, related_issue_id=related_issue_id)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def list_notifications(db: Session, *, user_id: str) -> list[Notification]:
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


def mark_all_read(db: Session, *, user_id: str) -> None:
    db.query(Notification).filter(Notification.user_id == user_id, Notification.read.is_(False)).update({"read": True})
    db.commit()


def log_action(db: Session, *, actor_id: str | None, actor_label: str, action: str, target: str, category: str) -> AuditLog:
    log = AuditLog(actor_id=actor_id, actor_label=actor_label, action=action, target=target, category=category)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
