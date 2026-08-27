import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-[var(--radius-md)] border py-2 pl-9 pr-3 text-sm"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}
