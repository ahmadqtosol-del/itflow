import { cn } from '../../utils/cn';

const PRIORITY_STYLES = {
  LOW: {
    color: 'var(--low)',
    bg: 'var(--low-soft)',
  },
  MEDIUM: {
    color: 'var(--medium)',
    bg: 'var(--medium-soft)',
  },
  HIGH: {
    color: 'var(--high)',
    bg: 'var(--high-soft)',
  },
  CRITICAL: {
    color: 'var(--critical)',
    bg: 'var(--critical-soft)',
  },
};

const STATUS_STYLES = {
  NEW: {
    color: 'var(--info)',
    bg: 'var(--info-soft)',
  },
  QUEUED: {
    color: 'var(--text-secondary)',
    bg: 'var(--bg-elevated)',
  },
  ASSIGNED: {
    color: 'var(--accent-2)',
    bg: 'var(--accent-2-soft)',
  },
  IN_PROGRESS: {
    color: 'var(--info)',
    bg: 'var(--info-soft)',
  },
  WAITING: {
    color: 'var(--waiting)',
    bg: 'var(--waiting-soft)',
  },
  RESOLVED: {
    color: 'var(--low)',
    bg: 'var(--low-soft)',
  },
  CLOSED: {
    color: 'var(--text-muted)',
    bg: 'var(--bg-elevated)',
  },
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
  const normalizedPriority = priority
    ? String(priority).toUpperCase()
    : 'LOW';

  const style =
    PRIORITY_STYLES[normalizedPriority] || PRIORITY_STYLES.LOW;

  const label =
    normalizedPriority.charAt(0) +
    normalizedPriority.slice(1).toLowerCase();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        className
      )}
      style={{
        color: style.color,
        background: style.bg,
        borderColor: `${style.color}22`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: style.color,
          boxShadow: `0 0 7px ${style.color}`,
        }}
      />

      {label}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const normalizedStatus = status
    ? String(status).toUpperCase()
    : 'NEW';

  const style =
    STATUS_STYLES[normalizedStatus] || STATUS_STYLES.NEW;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        className
      )}
      style={{
        color: style.color,
        background: style.bg,
        borderColor: `${style.color}22`,
      }}
    >
      {STATUS_LABELS[normalizedStatus] || normalizedStatus}
    </span>
  );
}