import { cn } from '../../utils/cn';

export default function StatCard({ label, value, icon: Icon, tone = 'default', hint, className }) {
  const toneColor = {
    default: 'var(--accent)',
    critical: 'var(--critical)',
    high: 'var(--high)',
    low: 'var(--low)',
    info: 'var(--info)',
  }[tone];

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border p-4', className)}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        {Icon && (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]"
            style={{ background: `${toneColor}1F`, color: toneColor }}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
