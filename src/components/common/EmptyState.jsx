import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-6 py-14 text-center" style={{ borderColor: 'var(--border)' }}>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
        <Icon size={22} />
      </span>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
