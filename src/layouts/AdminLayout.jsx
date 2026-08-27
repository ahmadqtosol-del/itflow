import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Background from '../components/common/Background';
import GlobalSearch from '../components/layout/GlobalSearch';
import QuickCreateModal from '../components/layout/QuickCreateModal';
import ToastContainer from '../components/common/Toast';

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/issues': 'All Issues',
  '/admin/kanban': 'Kanban Board',
  '/admin/active': 'Active Issues',
  '/admin/solved': 'Solved Issues',
  '/admin/employees': 'Employees',
  '/admin/team': 'IT Team',
  '/admin/performance': 'Performance',
  '/admin/messages': 'Messages',
  '/admin/notifications': 'Notifications',
  '/admin/reports': 'Reports',
  '/admin/audit': 'Audit Logs',
  '/admin/settings': 'Settings',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = pathname.startsWith('/admin/issues/') ? 'Issue Details' : TITLES[pathname] || 'QTOSOL';

  return (
    <div className="flex min-h-screen">
      <Background />
      <Sidebar role="admin" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title={title} breadcrumb="Admin" role="admin" />
        <main className="flex-1 px-5 py-6">
          <Outlet />
        </main>
      </div>
      <GlobalSearch />
      <QuickCreateModal />
      <ToastContainer />
    </div>
  );
}
