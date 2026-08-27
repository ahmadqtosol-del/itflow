export default function LoadingState({ rows = 4, label = 'Loading…' }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 w-full animate-pulse rounded-[var(--radius-md)]"
          style={{ background: 'var(--bg-elevated)' }}
        />
      ))}
    </div>
  );
}
