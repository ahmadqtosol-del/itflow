import { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const ICONS = { success: CheckCircle2, info: Info, error: AlertTriangle };
const COLORS = { success: 'var(--low)', info: 'var(--info)', error: 'var(--critical)' };

function ToastItem({ toast }) {
  const dismissToast = useUiStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismissToast(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, dismissToast]);

  const Icon = ICONS[toast.type || 'info'];
  return (
    <div
      className="animate-fade-in-up flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 shadow-lg"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', minWidth: 280 }}
    >
      <Icon size={18} style={{ color: COLORS[toast.type || 'info'] }} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        {toast.title && <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{toast.title}</p>}
        {toast.message && <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{toast.message}</p>}
      </div>
      <button onClick={() => dismissToast(toast.id)} style={{ color: 'var(--text-muted)' }} aria-label="Dismiss notification">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
