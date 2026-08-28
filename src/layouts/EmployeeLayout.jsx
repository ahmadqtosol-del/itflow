import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Background from '../components/common/Background';
import GlobalSearch from '../components/layout/GlobalSearch';
import QuickCreateModal from '../components/layout/QuickCreateModal';
import ToastContainer from '../components/common/Toast';

const TITLES = {
  '/employee': 'Home',
  '/employee/problems': 'My Problems',
  '/employee/report': 'Report Problem',
  '/employee/kanban': 'Kanban',
  '/employee/solved': 'Solved Tasks',
  '/employee/messages': 'Messages',
  '/employee/notifications': 'Notifications',
  '/employee/settings': 'Settings',
};

export default function EmployeeLayout() {
  const { pathname } = useLocation();

  const title = pathname.startsWith(
    '/employee/problems/'
  )
    ? 'Issue Details'
    : TITLES[pathname] || 'QTOSOL';

  return (
    <div className="relative flex min-h-screen">
      <Background />

      <Sidebar role="employee" />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          title={title}
          breadcrumb="Employee"
          role="employee"
        />

        <main className="relative flex-1 px-4 py-6 sm:px-5 lg:px-7">
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
      <QuickCreateModal />
      <ToastContainer />
    </div>
  );
}