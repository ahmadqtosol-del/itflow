import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import EmployeeLayout from './layouts/EmployeeLayout';
import AdminLayout from './layouts/AdminLayout';

import EmployeeHome from './pages/employee/Home';
import MyProblems from './pages/employee/MyProblems';
import IssueDetails from './pages/employee/IssueDetails';
import ReportProblem from './pages/employee/ReportProblem';
import EmployeeKanban from './pages/employee/Kanban';
import SolvedTasks from './pages/employee/SolvedTasks';
import EmployeeMessages from './pages/employee/Messages';
import Notifications from './pages/employee/Notifications';
import EmployeeSettings from './pages/employee/Settings';

import AdminDashboard from './pages/admin/Dashboard';
import AllIssues from './pages/admin/AllIssues';
import AdminIssueDetails from './pages/employee/IssueDetails';
import AdminKanban from './pages/admin/AdminKanban';
import ActiveIssues from './pages/admin/ActiveIssues';
import SolvedIssues from './pages/admin/SolvedIssues';
import Employees from './pages/admin/Employees';
import ITTeam from './pages/admin/ITTeam';
import Performance from './pages/admin/Performance';
import AdminMessages from './pages/admin/AdminMessages';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeHome />} />
          <Route path="problems" element={<MyProblems />} />
          <Route path="problems/:id" element={<IssueDetails />} />
          <Route path="report" element={<ReportProblem />} />
          <Route path="kanban" element={<EmployeeKanban />} />
          <Route path="solved" element={<SolvedTasks />} />
          <Route path="messages" element={<EmployeeMessages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<EmployeeSettings />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="issues" element={<AllIssues />} />
          <Route path="issues/:id" element={<AdminIssueDetails />} />
          <Route path="kanban" element={<AdminKanban />} />
          <Route path="active" element={<ActiveIssues />} />
          <Route path="solved" element={<SolvedIssues />} />
          <Route path="employees" element={<Employees />} />
          <Route path="team" element={<ITTeam />} />
          <Route path="performance" element={<Performance />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
