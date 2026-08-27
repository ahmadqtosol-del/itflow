from fastapi import APIRouter

from app.api.routes import (
    issues,
    users,
    notifications,
    audit,
    dashboard,
    settings,
    conversations,
    auth,
    attachments,
)


api_router = APIRouter()


api_router.include_router(auth.router)

api_router.include_router(issues.router)

api_router.include_router(attachments.router)

api_router.include_router(users.router)

api_router.include_router(notifications.router)

api_router.include_router(audit.router)

api_router.include_router(dashboard.router)

api_router.include_router(settings.router)

api_router.include_router(conversations.router)