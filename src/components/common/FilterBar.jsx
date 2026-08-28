import { cn } from '../../utils/cn';

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="focus-ring rounded-xl border px-3 py-2 text-xs font-medium outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.045)',
        borderColor: 'var(--glass-border)',
        color: 'var(--text-primary)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      aria-label={label}
    >
      <option value="">{label}</option>

      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function FilterBar({
  children,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}