import { cn } from '../../utils/cn';

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
  className,
}) {
 const toneStyles = {
  default: {
    gradient: 'var(--gradient-purple-blue)',
    glow: 'rgba(59,130,246,0.18)',
  },
  critical: {
    gradient: 'var(--gradient-pink-orange)',
    glow: 'rgba(244,114,182,0.18)',
  },
  high: {
    gradient: 'var(--gradient-pink-orange)',
    glow: 'rgba(251,146,60,0.18)',
  },
  low: {
    gradient: 'var(--gradient-green-cyan)',
    glow: 'rgba(52,211,153,0.18)',
  },
  info: {
    gradient: 'var(--gradient-cyan-blue)',
    glow: 'rgba(34,211,238,0.18)',
  },
};

  const current = toneStyles[tone] || toneStyles.default;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5',
        className
      )}
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      {/* Accent light */}
      <div
        className="absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: current.glow }}
      />

      {/* Top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
        }}
      />

      <div className="relative flex items-start justify-between">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.13em]"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>

        {Icon && (
          <span
  className="flex h-9 w-9 items-center justify-center rounded-xl border"
  style={{
    background: current.gradient,
    borderColor: 'rgba(255,255,255,0.18)',
    color: '#fff',
    boxShadow: `0 6px 20px ${current.glow}`,
  }}
>
  <Icon size={16} strokeWidth={2} />
</span>
        )}
      </div>

      <p
        className="relative mt-3 text-[26px] font-semibold tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>

      {hint && (
        <p
          className="relative mt-1 text-[11px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}