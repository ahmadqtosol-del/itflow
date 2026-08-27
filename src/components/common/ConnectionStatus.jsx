import { useConnectionStore } from '../../store/connectionStore';
import { cn } from '../../utils/cn';

const CONFIG = {
  CONNECTED: { label: 'Live', color: 'var(--low)', tooltip: 'Real-time connection active' },
  RECONNECTING: { label: 'Reconnecting…', color: 'var(--medium)', tooltip: 'Attempting to restore the connection' },
  OFFLINE: { label: 'Offline', color: 'var(--critical)', tooltip: 'Real-time updates are paused' },
};

export default function ConnectionStatus({ className }) {
  const status = useConnectionStore((s) => s.status);
  const c = CONFIG[status] || CONFIG.OFFLINE;
  return (
    <div
      className={cn('group relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', className)}
      style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
      title={c.tooltip}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === 'CONNECTED' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: c.color }} />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
      </span>
      {c.label}
    </div>
  );
}
