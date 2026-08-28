// Reusable ambient background used throughout ITFlow.
// Visual only — it does not affect application logic.

export default function Background({ variant = 'app' }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--bg-canvas)' }}
      aria-hidden="true"
    >
      {/* Pink/magenta ambient glow */}
      <div
        className="absolute -left-[8%] -top-[18%] h-[65vh] w-[65vh] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(244,114,182,0.16) 0%, rgba(244,114,182,0) 68%)',
          filter: 'blur(10px)',
          animation: 'drift 24s ease-in-out infinite',
        }}
      />

      {/* Purple ambient glow */}
      <div
        className="absolute -right-[10%] -top-[10%] h-[62vh] w-[62vh] rounded-full"
        style={{
          background:
            'radial-gradient(circle, var(--glow-purple) 0%, rgba(139,92,246,0) 68%)',
          filter: 'blur(14px)',
          animation: 'drift-rev 28s ease-in-out infinite',
        }}
      />

      {/* Orange lower glow */}
      <div
        className="absolute -bottom-[22%] right-[4%] h-[60vh] w-[60vh] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.11) 0%, rgba(251,146,60,0) 68%)',
          filter: 'blur(16px)',
          animation: 'drift-rev 26s ease-in-out infinite',
        }}
      />

      {/* Cyan lower-left glow */}
      <div
        className="absolute -bottom-[15%] -left-[6%] h-[55vh] w-[55vh] rounded-full"
        style={{
          background:
            'radial-gradient(circle, var(--glow-secondary) 0%, rgba(34,211,238,0) 68%)',
          filter: 'blur(14px)',
          animation: 'drift 30s ease-in-out infinite',
        }}
      />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(148,178,255,0.55) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Login variant: denser grid */}
      {variant === 'login' && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(rgba(148,178,255,0.35) 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        />
      )}

      {/* Dark readability overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,11,23,0.02) 0%, rgba(7,11,23,0.18) 52%, var(--bg-canvas) 100%)',
        }}
      />
    </div>
  );
}