import { NavLink } from 'react-router-dom';

import {
  Home,
  ClipboardList,
  PlusCircle,
  Kanban as KanbanIcon,
  CheckCircle2,
  MessageSquare,
  Bell,
  LayoutDashboard,
  ListChecks,
  Users,
  Wrench,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import UserAvatar from '../common/UserAvatar';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';


const EMPLOYEE_NAV = [
  { to: '/employee', label: 'Home', icon: Home, end: true },
  { to: '/employee/problems', label: 'My Problems', icon: ClipboardList },
  { to: '/employee/report', label: 'Report Problem', icon: PlusCircle },
  { to: '/employee/kanban', label: 'Kanban', icon: KanbanIcon },
  { to: '/employee/solved', label: 'Solved Tasks', icon: CheckCircle2 },
  { to: '/employee/messages', label: 'Messages', icon: MessageSquare },
  { to: '/employee/notifications', label: 'Notifications', icon: Bell },
];


const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/issues', label: 'All Issues', icon: ListChecks },
  { to: '/admin/kanban', label: 'Kanban Board', icon: KanbanIcon },
  { to: '/admin/active', label: 'Active Issues', icon: ClipboardList },
  { to: '/admin/solved', label: 'Solved Issues', icon: CheckCircle2 },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/team', label: 'IT Team', icon: Wrench },
  { to: '/admin/performance', label: 'Performance', icon: BarChart3 },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/audit', label: 'Audit Logs', icon: ShieldCheck },
];


function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            'linear-gradient(135deg, var(--accent), var(--accent-purple) 55%, var(--accent-2))',

          boxShadow:
            '0 8px 25px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.28)',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8.5 14.5L12.2 18.2L20 9.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p
            className="text-[15px] font-bold tracking-[0.18em]"
            style={{ color: 'var(--text-primary)' }}
          >
            QTOSOL
          </p>

          <p
            className="text-[9px] uppercase tracking-[0.22em]"
            style={{ color: 'var(--text-muted)' }}
          >
            ITFlow
          </p>
        </div>
      )}
    </div>
  );
}


function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
          isActive ? 'font-medium' : 'font-normal'
        )
      }
      style={({ isActive }) => ({
        color: isActive
          ? 'var(--text-primary)'
          : 'var(--text-secondary)',

        background: isActive
          ? 'linear-gradient(90deg, var(--accent-soft), transparent)'
          : 'transparent',

        boxShadow: isActive
          ? 'inset 0 0 0 1px rgba(59,130,246,0.12), 0 6px 20px var(--glow-primary)'
          : 'none',
      })}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, var(--accent), var(--accent-2))',

                boxShadow:
                  '0 0 12px rgba(59,130,246,0.7)',
              }}
            />
          )}

          <item.icon
            size={17}
            strokeWidth={isActive ? 2.2 : 1.8}
            className="shrink-0"
          />

          {!collapsed && (
            <span className="truncate">
              {item.label}
            </span>
          )}

          {collapsed && (
            <span
              className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
              style={{
                background: 'var(--glass-bg-strong)',
                borderColor: 'var(--glass-border-strong)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                zIndex: 50,
              }}
            >
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}


export default function Sidebar({ role }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const nav =
    role === 'admin'
      ? ADMIN_NAV
      : EMPLOYEE_NAV;

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r transition-[width] duration-300',
        collapsed ? 'w-[76px]' : 'w-[258px]'
      )}
      style={{
        background: 'var(--glass-bg-strong)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '10px 0 40px rgba(15,23,42,0.08)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        <Logo collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {!collapsed && (
          <p
            className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Workspace
          </p>
        )}

        {nav.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div
        className="space-y-1 border-t px-3 py-4"
        style={{
          borderColor: 'var(--glass-border)',
        }}
      >
        <NavItem
          item={{
            to: `/${role}/settings`,
            label: 'Settings',
            icon: Settings,
          }}
          collapsed={collapsed}
        />

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
          style={{
            color: 'var(--text-secondary)',
          }}
        >
          

        
        </a>

        <div
          className="my-3 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--glass-border), transparent)',
          }}
        />

        {/* User */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-2 py-2',
            !collapsed && 'justify-between'
          )}
          style={{
            background: collapsed
              ? 'transparent'
              : 'var(--glass-bg-soft)',

            borderColor: collapsed
              ? 'transparent'
              : 'var(--glass-border)',

            borderWidth: 1,
          }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <UserAvatar
              name={user?.name || 'User'}
              color={user?.avatarColor}
              status="Available"
              size="sm"
            />

            {!collapsed && (
              <div className="min-w-0">
                <p
                  className="truncate text-xs font-semibold"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  {user?.name || 'User'}
                </p>

                <p
                  className="truncate text-[10px]"
                  style={{
                    color: 'var(--text-muted)',
                  }}
                >
                  {user?.department || 'IT'}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="focus-ring rounded-lg p-1.5 transition-colors"
              style={{
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'var(--accent-soft)';
                e.currentTarget.style.color =
                  'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'transparent';
                e.currentTarget.style.color =
                  'var(--text-muted)';
              }}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

        {/* Collapse */}
        <button
          onClick={toggleSidebar}
          className="focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs transition-colors"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'var(--glass-bg-hover)';
            e.currentTarget.style.color =
              'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'transparent';
            e.currentTarget.style.color =
              'var(--text-muted)';
          }}
          aria-label={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
        >
          {collapsed ? (
            <ChevronsRight size={15} />
          ) : (
            <>
              <ChevronsLeft size={15} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
