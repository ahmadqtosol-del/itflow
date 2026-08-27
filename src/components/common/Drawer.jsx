import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: 'rgba(5,8,16,0.55)' }} onClick={onClose} />
      <div
        className={`relative flex h-full w-full ${width} flex-col border-l animate-fade-in-up`}
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="focus-ring rounded-full p-1" style={{ color: 'var(--text-muted)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
