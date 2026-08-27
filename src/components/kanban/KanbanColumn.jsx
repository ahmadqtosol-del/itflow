export default function KanbanColumn({ title, count, children, onDrop, onDragOver }) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex w-72 shrink-0 flex-col rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: 'var(--border-soft)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2.5" style={{ minHeight: 120, maxHeight: 'calc(100vh - 320px)' }}>
        {children}
      </div>
    </div>
  );
}