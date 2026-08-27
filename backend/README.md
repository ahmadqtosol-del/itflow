# ITFlow API — Backend (Chunk 2)

FastAPI backend for ITFlow, using:
- **SQL database** — SQLAlchemy + Alembic migrations (SQLite by default, Postgres-ready via `DATABASE_URL`)
- **Firebase Authentication** — frontend signs users in with Firebase; this API verifies the ID token on every request
- **Resend** — transactional email for issue lifecycle events (created, assigned, status changed, resolved, new message, critical alert)
- A WebSocket endpoint (`/ws`) broadcasting `ISSUE_CREATED` / `ISSUE_UPDATED` / `ISSUE_ASSIGNED` / `MESSAGE_CREATED` events, matching the frontend's `wsClient` contract exactly

## 1. Setup

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

By default `FIREBASE_ENABLED=false` and `EMAIL_ENABLED=false`, so you can run and explore the whole API immediately with **zero external accounts** — auth falls back to a dev header, and emails just log instead of sending. Flip both on when you're ready (see below).

## 2. Database

```bash
alembic upgrade head       # creates itflow.db (or your Postgres schema)
python -m app.seed         # loads demo employees, technicians, admin, and issues
```

To switch to Postgres, set `DATABASE_URL=postgresql+psycopg://user:pass@host:5432/itflow` in `.env`, install `psycopg[binary]`, and re-run the two commands above.

## 3. Run

```bash
uvicorn app.main:app --reload --port 8000
```

- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
- WebSocket: `ws://localhost:8000/ws`

### Dev auth (no Firebase needed)

Every endpoint expects `Authorization: Bearer <firebase_id_token>` once `FIREBASE_ENABLED=true`. Until then, pass `X-Dev-User-Email: admin@itflow.dev` (or any seeded user's email) instead — the API resolves that to a local user the same way it would resolve a decoded Firebase token.

```bash
curl -H "X-Dev-User-Email: admin@itflow.dev" http://localhost:8000/api/v1/dashboard/admin-summary
```

## 4. Turning on Firebase Authentication

1. In the [Firebase console](https://console.firebase.google.com), create/open your project → **Project settings → Service accounts → Generate new private key**. This downloads a JSON file.
2. Save it as `firebase-service-account.json` in this folder (already `.gitignore`d), or point `FIREBASE_CREDENTIALS_PATH` at wherever you put it.
3. Set `FIREBASE_ENABLED=true` in `.env`.
4. On the **frontend**, add the Firebase client SDK, sign users in there, and send `Authorization: Bearer <idToken>` (from `getIdToken()`) on every API request instead of `X-Dev-User-Email`.
5. First sign-in auto-provisions a local `User` row (role defaults to `EMPLOYEE`) keyed by `firebase_uid`. Promote someone to technician/admin via `PATCH /api/v1/employees/{id}` (admin-only) — role isn't stored in Firebase, it lives here so the rest of the app can query/join on it.

Email/password, Google sign-in, password reset flows, etc. all happen entirely on the frontend via the Firebase client SDK — this backend only ever verifies the resulting ID token.

## 5. Turning on Resend email

1. Create an account at [resend.com](https://resend.com), verify a sending domain (or use their test domain while developing), and grab an API key.
2. Set in `.env`:
   ```
   EMAIL_ENABLED=true
   RESEND_API_KEY=re_your_key
   RESEND_FROM_EMAIL=ITFlow <notifications@yourdomain.com>
   ```
3. That's it — `app/services/email_service.py` already sends on every relevant event:
   - Issue created → confirmation to the employee
   - Technician assigned → notice to the employee
   - Status changed / resolved → notice to the employee
   - New comment → notice to the other party
   - Critical priority issue created → alert to all admins

   Email sends are best-effort and never block or fail the underlying request — a Resend outage degrades gracefully to "no email sent," never a broken API call.

## 6. Migrations

Schema changes go through Alembic, not `create_all` (which only exists as a dev convenience on app boot):

```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## Project layout

```
app/
  core/        settings, Firebase-token auth dependency, role guards
  db/          SQLAlchemy engine/session
  models/      User, Issue, IssueTimelineEvent, IssueComment, Notification, AuditLog
  schemas/     Pydantic request/response shapes (mirrors the frontend's mock data shapes)
  crud/        DB read/write logic, kept out of the route handlers
  services/    firebase_auth.py, email_service.py (Resend), ws_manager.py (WebSocket broadcast)
  api/routes/  issues, users, notifications, audit, dashboard, websocket
  seed.py      demo data loader matching the frontend's mock/*.js exactly
migrations/    Alembic
```

## API surface (matches the frontend's `services/api/*` one-to-one)

| Frontend service        | Backend routes |
|--------------------------|----------------|
| `issueService`           | `GET/POST /api/v1/issues`, `GET/PATCH /api/v1/issues/{id}`, `POST /issues/{id}/rate`, `POST /issues/{id}/comments` |
| `userService`            | `GET /api/v1/users/me`, `GET /api/v1/employees`, `PATCH /api/v1/employees/{id}`, `GET /api/v1/technicians` |
| `notificationService`    | `GET /api/v1/notifications`, `POST /api/v1/notifications/read-all` |
| `dashboardService`       | `GET /api/v1/dashboard/admin-summary`, `/employee-summary`, `/trend` |
| audit logs (admin page)  | `GET /api/v1/audit-logs` |
| `wsClient`                | `ws://.../ws` — same event names the frontend already listens for |

## Not included (intentionally — connect these next)

Rate limiting/throttling, file/attachment storage (S3 or similar), refresh-token rotation beyond what Firebase already provides, and production-grade logging/observability. The architecture leaves room for all of them without further redesign.
