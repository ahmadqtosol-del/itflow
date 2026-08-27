import { cn } from '../../utils/cn';

const PRIORITY_STYLES = {
  LOW: { color: 'var(--low)', bg: 'var(--low-soft)' },
  MEDIUM: { color: 'var(--medium)', bg: 'var(--medium-soft)' },
  HIGH: { color: 'var(--high)', bg: 'var(--high-soft)' },
  CRITICAL: { color: 'var(--critical)', bg: 'var(--critical-soft)' },
};

const STATUS_STYLES = {
  NEW: { color: 'var(--info)', bg: 'var(--info-soft)' },
  QUEUED: { color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
  ASSIGNED: { color: 'var(--accent-2)', bg: 'var(--info-soft)' },
  IN_PROGRESS: { color: 'var(--info)', bg: 'var(--info-soft)' },
  WAITING: { color: 'var(--waiting)', bg: 'var(--waiting-soft)' },
  RESOLVED: { color: 'var(--low)', bg: 'var(--low-soft)' },
  CLOSED: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
};

const STATUS_LABELS = {
  NEW: 'New',
  QUEUED: 'Queued',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export function PriorityBadge({ priority, className }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className
      )}
      style={{ color: s.color, background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.NEW;
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', className)}
      style={{ color: s.color, background: s.bg }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
