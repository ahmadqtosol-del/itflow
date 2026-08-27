import { useEffect, useState } from 'react';
import { Menu, Plus, Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConnectionStatus from '../common/ConnectionStatus';
import UserAvatar from '../common/UserAvatar';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/api/notificationService';

export default function Header({ title, breadcrumb, role }) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setQuickCreateOpen = useUiStore((s) => s.setQuickCreateOpen);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService.list().then((list) => {
      setUnread(list.filter((n) => !n.read).length);
    }).catch(() => setUnread(0));
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3 backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg-canvas) 88%, transparent)', borderColor: 'var(--border)' }}
    >
      <button onClick={toggleSidebar} className="focus-ring rounded-[var(--radius-sm)] p-1.5" style={{ color: 'var(--text-secondary)' }} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>

      <div className="min-w-0 shrink-0">
        {breadcrumb && (
          <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>{breadcrumb}</p>
        )}
        <h1 className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="focus-ring ml-2 hidden flex-1 items-center gap-2 rounded-[var(--radius-md)] border px-3 py-1.5 text-left text-sm sm:flex"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-muted)', maxWidth: 420 }}
      >
        Search issues, employees, messages…
        <kbd className="ml-auto rounded border px-1.5 py-0.5 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setQuickCreateOpen(true)}
          className="focus-ring hidden items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium text-white sm:flex"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={15} /> New Issue
        </button>
        <button onClick={toggleTheme} className="focus-ring rounded-[var(--radius-sm)] p-2" style={{ color: 'var(--text-secondary)' }} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          onClick={() => navigate(`/${role}/notifications`)}
          className="focus-ring relative rounded-[var(--radius-sm)] p-2"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Notifications"
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ background: 'var(--critical)' }} />
          )}
        </button>
        <ConnectionStatus className="hidden md:inline-flex" />
        <UserAvatar name={user.name} color={user.avatarColor} size="sm" />
      </div>
    </header>
  );
}
