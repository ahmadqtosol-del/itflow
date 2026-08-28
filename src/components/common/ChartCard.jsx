import { cn } from '../../utils/cn';

export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        'glass-highlight relative overflow-hidden rounded-2xl border p-5',
        className
      )}
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      {/* Top glass reflection */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        }}
      />

      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>

          {subtitle && (
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}