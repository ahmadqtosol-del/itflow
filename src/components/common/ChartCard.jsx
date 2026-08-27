import { cn } from '../../utils/cn';

export default function ChartCard({ title, subtitle, action, children, className }) {
  return (
    <div
      className={cn('rounded-[var(--radius-lg)] border p-5', className)}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
