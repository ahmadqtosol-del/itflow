import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in-up"
        style={{ background: 'rgba(5,8,16,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widths[size]} animate-fade-in-up rounded-[var(--radius-lg)] border`}
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="focus-ring rounded-full p-1" style={{ color: 'var(--text-muted)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {/* When footer is provided externally, wrap children in a padded scrollable div.
            When footer is absent, children own their full layout (e.g. a <form> that
            includes its own footer buttons so type="submit" fires correctly). */}
        {footer ? (
          <>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
            <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              {footer}
            </div>
          </>
        ) : (
          <div className="max-h-[80vh] overflow-y-auto">{children}</div>
        )}
      </div>
    </div>
  );
}
