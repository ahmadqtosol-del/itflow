export default function LoadingState({
  rows = 4,
  label = 'Loading…',
}) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label={label}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="relative h-14 w-full overflow-hidden rounded-xl border"
          style={{
            background: 'rgba(255,255,255,0.035)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.045), transparent)',
            }}
          />
        </div>
      ))}
    </div>
  );
}