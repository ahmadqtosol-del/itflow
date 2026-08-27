export default function Timeline({ items = [] }) {
  return (
    <ol className="relative ml-2 space-y-5 border-l pl-5" style={{ borderColor: 'var(--border)' }}>
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span
            className="absolute -left-[26px] top-0.5 h-3 w-3 rounded-full border-2"
            style={{ background: 'var(--accent)', borderColor: 'var(--bg-surface)' }}
          />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
        </li>
      ))}
    </ol>
  );
}
