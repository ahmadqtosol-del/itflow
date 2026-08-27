import { Wrench, MessageSquare, AlertTriangle, Bell } from 'lucide-react';
import { timeAgo } from '../../utils/format';

const ICONS = { Issues: Wrench, Messages: MessageSquare, System: AlertTriangle };

export default function NotificationItem({ notification }) {
  const Icon = ICONS[notification.category] || Bell;
  return (
    <div
      className="flex items-start gap-3 rounded-[var(--radius-md)] border px-3.5 py-3"
      style={{
        borderColor: 'var(--border)',
        background: notification.read ? 'var(--bg-surface)' : 'var(--accent-soft)',
      }}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
        <Icon size={15} />
      </span>
      <div className="flex-1">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{notification.title}</p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(notification.time)} · {notification.category}</p>
      </div>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />}
    </div>
  );
}
