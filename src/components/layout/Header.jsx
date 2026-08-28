
import { useEffect, useState } from 'react';

import {
  Menu,
  Plus,
  Bell,
  Sun,
  Moon,
  Search,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import ConnectionStatus from '../common/ConnectionStatus';
import UserAvatar from '../common/UserAvatar';

import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/api/notificationService';


export default function Header({
  title,
  breadcrumb,
  role,
}) {
  const toggleSidebar = useUiStore(
    (s) => s.toggleSidebar
  );

  const setCommandPaletteOpen = useUiStore(
    (s) => s.setCommandPaletteOpen
  );

  const setQuickCreateOpen = useUiStore(
    (s) => s.setQuickCreateOpen
  );

  const theme = useUiStore(
    (s) => s.theme
  );

  const toggleTheme = useUiStore(
    (s) => s.toggleTheme
  );

  const user = useAuthStore(
    (s) => s.user
  );

  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);


  useEffect(() => {
    notificationService
      .list()
      .then((list) => {
        setUnread(
          list.filter(
            (notification) =>
              !notification.read
          ).length
        );
      })
      .catch(() => {
        setUnread(0);
      });
  }, []);


  return (
    <header
      className="sticky top-0 z-30 flex min-h-[70px] items-center gap-3 border-b px-5 py-3"
      style={{
        background:
          'var(--glass-bg-strong)',

        borderColor:
          'var(--glass-border)',

        backdropFilter:
          'blur(22px)',

        WebkitBackdropFilter:
          'blur(22px)',

        boxShadow:
          '0 8px 30px rgba(15,23,42,0.04)',
      }}
    >

      {/* Sidebar */}
      <button
        onClick={toggleSidebar}
        className="focus-ring rounded-xl p-2 transition-colors"
        style={{
          color:
            'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            'var(--glass-bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            'transparent';
        }}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>


      {/* Title */}
      <div className="min-w-0 shrink-0">
        {breadcrumb && (
          <p
            className="mb-0.5 truncate text-[10px] font-medium uppercase tracking-[0.15em]"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            {breadcrumb}
          </p>
        )}

        <h1
          className="truncate text-sm font-semibold"
          style={{
            color:
              'var(--text-primary)',
          }}
        >
          {title}
        </h1>
      </div>


      {/* Search */}
      <button
        onClick={() =>
          setCommandPaletteOpen(true)
        }
        className="focus-ring ml-3 hidden h-10 flex-1 items-center gap-2 rounded-xl border px-3 text-left text-sm transition-all sm:flex"
        style={{
          background:
            'var(--glass-bg-soft)',

          borderColor:
            'var(--glass-border)',

          color:
            'var(--text-muted)',

          maxWidth: 430,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            'var(--glass-bg-hover)';

          e.currentTarget.style.borderColor =
            'var(--glass-border-strong)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            'var(--glass-bg-soft)';

          e.currentTarget.style.borderColor =
            'var(--glass-border)';
        }}
      >
        <Search size={15} />

        <span>
          Search issues, employees, messages...
        </span>

        <kbd
          className="ml-auto rounded-md border px-1.5 py-0.5 text-[9px]"
          style={{
            borderColor:
              'var(--glass-border)',

            color:
              'var(--text-muted)',

            background:
              'var(--glass-bg)',
          }}
        >
          Ctrl K
        </kbd>
      </button>


      {/* Right controls */}
      <div className="ml-auto flex items-center gap-1.5">

        {/* New Issue */}
        <button
          onClick={() =>
            setQuickCreateOpen(true)
          }
          className="focus-ring hidden items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-px sm:flex"
          style={{
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-purple))',

            boxShadow:
              '0 8px 24px var(--glow-primary)',
          }}
        >
          <Plus size={15} />
          New Issue
        </button>


        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="focus-ring rounded-xl p-2.5 transition-colors"
          style={{
            color:
              'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'var(--glass-bg-hover)';

            e.currentTarget.style.color =
              'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'transparent';

            e.currentTarget.style.color =
              'var(--text-secondary)';
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun size={17} />
          ) : (
            <Moon size={17} />
          )}
        </button>


        {/* Notifications */}
        <button
          onClick={() =>
            navigate(
              `/${role}/notifications`
            )
          }
          className="focus-ring relative rounded-xl p-2.5 transition-colors"
          style={{
            color:
              'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'var(--glass-bg-hover)';

            e.currentTarget.style.color =
              'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'transparent';

            e.currentTarget.style.color =
              'var(--text-secondary)';
          }}
          aria-label="Notifications"
        >
          <Bell size={17} />

          {unread > 0 && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2"
              style={{
                background:
                  'var(--critical)',

                boxShadow:
                  '0 0 10px rgba(240,68,56,0.7)',

                ringColor:
                  'var(--bg-surface)',
              }}
            />
          )}
        </button>


        {/* Connection */}
        <ConnectionStatus
          className="hidden md:inline-flex"
        />


        {/* Avatar */}
        <div
          className="ml-1 border-l pl-3"
          style={{
            borderColor:
              'var(--glass-border)',
          }}
        >
          <UserAvatar
            name={user?.name || 'User'}
            color={user?.avatarColor}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
}
