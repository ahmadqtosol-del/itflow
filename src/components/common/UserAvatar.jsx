import { initials } from '../../utils/format';
import { cn } from '../../utils/cn';

const SIZES = { sm: 'h-6 w-6 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-base' };

export default function UserAvatar({ name, color = '#3b82f6', size = 'md', status, className }) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn('flex items-center justify-center rounded-full font-semibold text-white', SIZES[size])}
        style={{ background: `linear-gradient(135deg, ${color}, var(--accent-2))` }}
      >
        {initials(name)}
      </span>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2"
          style={{
            background:
              status === 'Available' || status === 'Active'
                ? 'var(--low)'
                : status === 'Busy'
                ? 'var(--high)'
                : status === 'Away'
                ? 'var(--medium)'
                : 'var(--text-muted)',
            boxShadow: '0 0 0 2px var(--bg-surface)',
          }}
        />
      )}
    </span>
  );
}
