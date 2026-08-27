import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', description = 'Please try again in a moment.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border px-6 py-14 text-center" style={{ borderColor: 'var(--critical)', background: 'var(--critical-soft)' }}>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--critical)' }}>
        <AlertTriangle size={22} />
      </span>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="mt-1 max-w-sm text-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring mt-4 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
