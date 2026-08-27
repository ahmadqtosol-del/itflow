"""Seeds the database with demo users, issues, SLA rules, categories, and departments that mirror the
frontend's mock data, so the UI looks identical the moment the real
API is wired in. Run with: `python -m app.seed`
"""
from app.db.session import Base, SessionLocal, engine
from app.models.issue import Issue, IssueStatus, IssuePriority, IssueTimelineEvent
from app.models.settings import Category, Department, SLARule
from app.models.user import User, UserRole

Base.metadata.create_all(bind=engine)

EMPLOYEES = [
    dict(id="emp-001", email="ahmad.raza@company.com", name="Ahmad Raza", department="Finance", avatar_color="#3b82f6"),
    dict(id="emp-002", email="sarah.ahmed@company.com", name="Sarah Ahmed", department="Marketing", avatar_color="#22d3ee"),
    dict(id="emp-003", email="john.doe@company.com", name="John Doe", department="Sales", avatar_color="#a78bfa"),
    dict(id="emp-004", email="fatima.noor@company.com", name="Fatima Noor", department="HR", avatar_color="#f79009"),
    dict(id="emp-005", email="bilal.hassan@company.com", name="Bilal Hassan", department="Operations", avatar_color="#22c55e", status="Disabled"),
    dict(id="emp-006", email="emily.chen@company.com", name="Emily Chen", department="Finance", avatar_color="#f04438"),
]

TECHNICIANS = [
    dict(id="tech-001", email="ahmad.khan@company.com", name="Ahmad Khan", specialization="Networking", rating=4.8, sla_success_rate=96, status="Available"),
    dict(id="tech-002", email="usman.tariq@company.com", name="Usman Tariq", specialization="Hardware", rating=4.6, sla_success_rate=91, status="Busy"),
    dict(id="tech-003", email="sana.iqbal@company.com", name="Sana Iqbal", specialization="Software & Accounts", rating=4.7, sla_success_rate=94, status="Available"),
    dict(id="tech-004", email="david.kim@company.com", name="David Kim", specialization="Endpoint Support", rating=4.4, sla_success_rate=87, status="Away"),
    dict(id="tech-005", email="zainab.sheikh@company.com", name="Zainab Sheikh", specialization="Security", rating=4.9, sla_success_rate=98, status="Offline"),
]

ADMIN = dict(id="adm-001", email="admin@itflow.dev", name="Sara Malik", department="IT Operations", avatar_color="#22d3ee")

ISSUES = [
    dict(id="IT-00124", title="Network connection problem", category="Network", priority="HIGH", status="IN_PROGRESS",
         employee_id="emp-001", technician_id="tech-001", device="LAPTOP-FIN-014", location="Floor 3, Finance Wing",
         description="Laptop keeps dropping the office Wi-Fi every 10-15 minutes.",
         timeline=["Issue created", "Assigned to Ahmad Khan", "Technician started working", "Status changed to In Progress"]),
    dict(id="IT-00128", title="Printer not working", category="Printer", priority="HIGH", status="NEW",
         employee_id="emp-003", technician_id=None, device="PRINTER-3F-02", location="Floor 3, Sales Wing",
         description="The 3rd floor printer shows an offline error.", timeline=["Issue created"]),
    dict(id="IT-00131", title="Email problem", category="Email", priority="MEDIUM", status="NEW",
         employee_id="emp-002", technician_id=None, device="DESKTOP-MKT-009", location="Floor 2, Marketing Wing",
         description="Outlook fails to sync and shows a repeated auth prompt.", timeline=["Issue created"]),
    dict(id="IT-00115", title="Software installation request", category="Software", priority="MEDIUM", status="WAITING",
         employee_id="emp-004", technician_id="tech-003", device="LAPTOP-HR-004", location="Floor 1, HR Wing",
         description="Need Adobe Acrobat Pro installed for contract redlining.",
         timeline=["Issue created", "Assigned to Sana Iqbal", "Waiting on license approval"]),
    dict(id="IT-00110", title="VPN connection problem", category="VPN", priority="LOW", status="RESOLVED",
         employee_id="emp-005", technician_id="tech-005", device="LAPTOP-OPS-021", location="Remote",
         description="Cannot connect to the company VPN from home.",
         root_cause="Expired VPN client certificate.", resolution="Reissued certificate and reconnected client profile.",
         employee_rating=5, employee_feedback="Quick fix, thank you!",
         timeline=["Issue created", "Assigned to Zainab Sheikh", "Root cause identified", "Issue resolved"]),
    dict(id="IT-00142", title="Account locked out after password reset", category="Account & Access", priority="CRITICAL", status="ASSIGNED",
         employee_id="emp-002", technician_id="tech-001", device="DESKTOP-MKT-009", location="Floor 2, Marketing Wing",
         description="Windows account locked after self-service password reset.",
         timeline=["Issue created", "Assigned to Ahmad Khan"]),
    dict(id="IT-00140", title="Suspicious phishing email reported", category="Security", priority="CRITICAL", status="QUEUED",
         employee_id="emp-003", technician_id=None, device="LAPTOP-SLS-007", location="Floor 3, Sales Wing",
         description="Email impersonating IT asking to confirm password via link.", timeline=["Issue created"]),
]

SLA_RULES = [
    dict(priority="Critical", response_target="15 min", resolution_target="30 min", response_minutes=15, resolution_minutes=30),
    dict(priority="High", response_target="30 min", resolution_target="2 hours", response_minutes=30, resolution_minutes=120),
    dict(priority="Medium", response_target="2 hours", resolution_target="8 hours", response_minutes=120, resolution_minutes=480),
    dict(priority="Low", response_target="4 hours", resolution_target="24 hours", response_minutes=240, resolution_minutes=1440),
]

CATEGORIES = [
    "Network", "Hardware", "Software", "Account & Access", "Email", "VPN", "Printer", "Security"
]

DEPARTMENTS = [
    "Finance", "Marketing", "Sales", "HR", "Operations", "IT Operations"
]


def seed_settings(db):
    if db.query(SLARule).count() == 0:
        for r in SLA_RULES:
            db.add(SLARule(**r))
    if db.query(Category).count() == 0:
        for c in CATEGORIES:
            db.add(Category(name=c))
    if db.query(Department).count() == 0:
        for d in DEPARTMENTS:
            db.add(Department(name=d))
    db.commit()


def run():
    db = SessionLocal()
    try:
        seed_settings(db)
        if db.query(User).count() > 0:
            print("Users & Issues already seeded — settings checked & seeded.")
            return

        db.add(User(role=UserRole.ADMIN, **ADMIN))
        for e in EMPLOYEES:
            db.add(User(role=UserRole.EMPLOYEE, **e))
        for t in TECHNICIANS:
            db.add(User(role=UserRole.TECHNICIAN, **t))
        db.commit()

        for raw in ISSUES:
            data = dict(raw)
            timeline = data.pop("timeline")
            data["priority"] = IssuePriority(data["priority"])
            data["status"] = IssueStatus(data["status"])
            issue = Issue(**data)
            db.add(issue)
            db.flush()
            for label in timeline:
                db.add(IssueTimelineEvent(issue_id=issue.id, label=label))
        db.commit()
        print(f"Seeded settings, {len(EMPLOYEES)} employees, {len(TECHNICIANS)} technicians, 1 admin, {len(ISSUES)} issues.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
