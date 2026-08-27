// Reusable ambient background used on the shell, login, and empty
// states. Pure CSS gradients + very subtle motion — never a literal
// photo behind content, per the design brief.
export default function Background({ variant = 'app' }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      <div
        className="absolute -top-1/3 left-1/4 h-[70vh] w-[70vh] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0) 70%)',
          animation: 'drift 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 -right-1/4 h-[60vh] w-[60vh] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.16) 0%, rgba(34,211,238,0) 70%)',
          animation: 'drift-rev 26s ease-in-out infinite',
        }}
      />
      {variant === 'login' && (
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(rgba(148,178,255,0.35) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,15,30,0) 0%, var(--bg-canvas) 85%)',
        }}
      />
    </div>
  );
}
