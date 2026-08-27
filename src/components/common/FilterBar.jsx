import { cn } from '../../utils/cn';

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="focus-ring rounded-[var(--radius-md)] border px-3 py-2 text-sm"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
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

export default function FilterBar({ children, className }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}
