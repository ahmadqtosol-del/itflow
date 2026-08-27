# Import every model module so Base.metadata knows about all tables
# before create_all()/Alembic autogenerate runs.
from app.models.user import User, UserRole, UserStatus  # noqa: F401
from app.models.issue import Issue, IssueStatus, IssuePriority, IssueTimelineEvent, IssueComment  # noqa: F401
from app.models.notification import Notification, AuditLog  # noqa: F401
from app.models.settings import SLARule, Category, Department  # noqa: F401
from app.models.message import Conversation, DirectMessage  # noqa: F401

from app.models.attachment import IssueAttachment
from app.models.issue import Issue, IssueComment, IssueTimelineEvent