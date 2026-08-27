import logging

import resend

from app.core.config import get_settings

logger = logging.getLogger("itflow.email")


def _client_ready() -> bool:
    settings = get_settings()
    if not settings.email_enabled:
        return False
    if not settings.resend_api_key:
        logger.warning("EMAIL_ENABLED is true but RESEND_API_KEY is not set — skipping send")
        return False
    resend.api_key = settings.resend_api_key
    return True


def _send(to: str, subject: str, html: str) -> None:
    if not _client_ready():
        logger.info("[email skipped] to=%s subject=%s", to, subject)
        return
    settings = get_settings()
    try:
        resend.Emails.send(
            {
                "from": settings.resend_from_email,
                "to": [to],
                "subject": subject,
                "html": html,
            }
        )
    except Exception:  # noqa: BLE001
        logger.exception("Failed to send email to %s", to)


def _wrap(title: str, body_html: str) -> str:
    return f"""
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background:#0a0f1e; padding:24px; border-radius:12px 12px 0 0;">
        <span style="color:#fff; font-size:18px; font-weight:600;">ITFlow</span>
      </div>
      <div style="border:1px solid #e3e8f2; border-top:none; border-radius:0 0 12px 12px; padding:24px;">
        <h2 style="margin:0 0 12px; color:#101828; font-size:17px;">{title}</h2>
        <div style="color:#4b5772; font-size:14px; line-height:1.6;">{body_html}</div>
      </div>
    </div>
    """


def send_issue_created_email(to: str, issue_id: str, title: str) -> None:
    html = _wrap(
        "We received your IT support request",
        f"<p><strong>{issue_id}</strong> — {title}</p>"
        f"<p>Our IT team has been notified and will respond according to the priority SLA. "
        f"You can track progress any time in ITFlow under <strong>My Problems</strong>.</p>",
    )
    _send(to, f"[{issue_id}] We received your request", html)


def send_issue_assigned_email(to: str, issue_id: str, title: str, technician_name: str) -> None:
    html = _wrap(
        "Your issue has a technician assigned",
        f"<p><strong>{issue_id}</strong> — {title}</p>"
        f"<p><strong>{technician_name}</strong> has been assigned to your issue and will begin working on it shortly.</p>",
    )
    _send(to, f"[{issue_id}] {technician_name} was assigned to your issue", html)


def send_issue_status_changed_email(to: str, issue_id: str, title: str, status_label: str) -> None:
    html = _wrap(
        f"Issue status updated: {status_label}",
        f"<p><strong>{issue_id}</strong> — {title}</p>"
        f"<p>The status of your issue changed to <strong>{status_label}</strong>.</p>",
    )
    _send(to, f"[{issue_id}] Status changed to {status_label}", html)


def send_issue_resolved_email(to: str, issue_id: str, title: str, resolution: str | None) -> None:
    html = _wrap(
        "Your issue has been resolved",
        f"<p><strong>{issue_id}</strong> — {title}</p>"
        + (f"<p><strong>Resolution:</strong> {resolution}</p>" if resolution else "")
        + "<p>If this doesn't fully fix the problem, reply in ITFlow to reopen the conversation with our team.</p>",
    )
    _send(to, f"[{issue_id}] Resolved", html)


def send_new_message_email(to: str, issue_id: str, sender_name: str, preview: str) -> None:
    html = _wrap(
        f"New message from {sender_name}",
        f"<p>On <strong>{issue_id}</strong>:</p><p style='font-style:italic;'>\u201c{preview}\u201d</p>",
    )
    _send(to, f"[{issue_id}] New message from {sender_name}", html)


def send_critical_issue_alert_email(to: str, issue_id: str, title: str) -> None:
    html = _wrap(
        "\u26a0\ufe0f Critical issue requires attention",
        f"<p><strong>{issue_id}</strong> — {title}</p>"
        f"<p>This issue was flagged <strong>Critical</strong> priority and needs immediate attention.</p>",
    )
    _send(to, f"[CRITICAL] {issue_id} needs attention", html)


def send_direct_message_email(to: str, sender_name: str, preview: str) -> None:
    html = _wrap(
        f"New message from {sender_name}",
        f"<p style='font-style:italic;'>\u201c{preview}\u201d</p>"
        f"<p>Open ITFlow to reply.</p>",
    )
    _send(to, f"New message from {sender_name}", html)


def send_new_issue_to_technician(
    technician_email: str,
    issue_id: str,
    issue_title: str,
    employee_name: str,
    employee_email: str,
    department: str,
    priority: str,
    category: str,
    description: str,
    submitted_at,
):
    subject = f"[ITFlow] New Issue #{issue_id} Requires Attention"

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 650px; margin: auto; padding: 24px;">

          <h2 style="color: #2563eb;">New IT Support Issue</h2>

          <p>
            A new support issue has been submitted to ITFlow
            and requires your attention.
          </p>

          <div style="
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
          ">

            <p><strong>Issue ID:</strong> {issue_id}</p>

            <p><strong>Title:</strong> {issue_title}</p>

            <p><strong>Submitted by:</strong> {employee_name}</p>

            <p><strong>Employee Email:</strong> {employee_email}</p>

            <p><strong>Department:</strong> {department}</p>

            <p><strong>Priority:</strong> {priority}</p>

            <p><strong>Category:</strong> {category}</p>

            <p><strong>Description:</strong><br>
              {description}
            </p>

            <p><strong>Submitted:</strong> {submitted_at}</p>

          </div>

          <p>
            Please log in to ITFlow to review and assign this issue.
          </p>

          <p>
            Regards,<br>
            <strong>ITFlow Helpdesk</strong>
          </p>

        </div>
      </body>
    </html>
    """

    _send(
        to=technician_email,
        subject=subject,
        html=html,
    )
