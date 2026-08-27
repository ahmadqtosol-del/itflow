import { NavLink } from 'react-router-dom';
import {
  Home, ClipboardList, PlusCircle, Kanban as KanbanIcon, CheckCircle2, MessageSquare, Bell,
  LayoutDashboard, ListChecks, Users, Wrench, BarChart3, FileText, ShieldCheck,
  Settings, HelpCircle, LogOut, ChevronsLeft, ChevronsRight,
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
    <div className="flex items-center gap-2.5 px-1">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
        <rect width="28" height="28" rx="8" fill="url(#itflow-grad)" />
        <path d="M9 14.5L12.2 17.7L19 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="itflow-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      {!collapsed && <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>QTOSOL</span>}
    </div>
  );
}

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'focus-ring group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors',
          isActive ? 'font-medium' : 'font-normal'
        )
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-soft)' : 'transparent',
      })}
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={17} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <span
          className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-1 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', zIndex: 50 }}
        >
          {item.label}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ role }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
      style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between px-3 py-4">
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5">
        {nav.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1 border-t px-2.5 py-3" style={{ borderColor: 'var(--border)' }}>
        <NavItem item={{ to: `/${role}/settings`, label: 'Settings', icon: Settings }} collapsed={collapsed} />
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="focus-ring flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <HelpCircle size={17} />
          {!collapsed && <span>Help</span>}
        </a>

        <div className="my-2 h-px" style={{ background: 'var(--border)' }} />

        <div className={cn('flex items-center gap-2.5 rounded-[var(--radius-md)] px-1.5 py-1.5', !collapsed && 'justify-between')}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <UserAvatar name={user.name} color={user.avatarColor} status="Available" size="sm" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>{user.department}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={logout} className="focus-ring rounded-[var(--radius-sm)] p-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Log out" title="Log out">
              <LogOut size={15} />
            </button>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="focus-ring mt-1 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] py-1.5 text-xs"
          style={{ color: 'var(--text-muted)' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>
    </aside>
  );
}
