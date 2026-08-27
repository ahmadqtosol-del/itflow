import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UnresolvedBanner({ count = 2, critical = false }) {
  const navigate = useNavigate();
  if (!count) return null;
  return (
    <button
      onClick={() => navigate('/employee/kanban')}
      className="focus-ring mb-5 flex w-full items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors"
      style={{
        borderColor: critical ? 'var(--critical)' : 'var(--border)',
        background: critical ? 'var(--critical-soft)' : 'var(--accent-soft)',
      }}
    >
      <span className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>
        <AlertTriangle size={16} style={{ color: critical ? 'var(--critical)' : 'var(--accent)' }} />
        {critical ? 'Critical IT issue requires attention.' : `You have ${count} unresolved IT request${count > 1 ? 's' : ''}.`}
      </span>
      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}
