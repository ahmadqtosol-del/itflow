export const currentEmployee = {
  id: 'emp-001',
  name: 'Ahmad Raza',
  email: 'ahmad.raza@company.com',
  role: 'employee',
  department: 'Finance',
  avatarColor: '#3b82f6',
};

export const currentAdmin = {
  id: 'adm-001',
  name: 'Sara Malik',
  email: 'admin@itflow.dev',
  role: 'admin',
  department: 'IT Operations',
  avatarColor: '#22d3ee',
};

export const employees = [
  { id: 'emp-001', name: 'Ahmad Raza', department: 'Finance', email: 'ahmad.raza@company.com', openIssues: 2, resolvedIssues: 18, lastActivity: '2026-08-18T08:10:00Z', status: 'Active' },
  { id: 'emp-002', name: 'Sarah Ahmed', department: 'Marketing', email: 'sarah.ahmed@company.com', openIssues: 1, resolvedIssues: 9, lastActivity: '2026-08-18T07:40:00Z', status: 'Active' },
  { id: 'emp-003', name: 'John Doe', department: 'Sales', email: 'john.doe@company.com', openIssues: 3, resolvedIssues: 22, lastActivity: '2026-08-17T16:22:00Z', status: 'Active' },
  { id: 'emp-004', name: 'Fatima Noor', department: 'HR', email: 'fatima.noor@company.com', openIssues: 0, resolvedIssues: 6, lastActivity: '2026-08-16T13:05:00Z', status: 'Active' },
  { id: 'emp-005', name: 'Bilal Hassan', department: 'Operations', email: 'bilal.hassan@company.com', openIssues: 1, resolvedIssues: 14, lastActivity: '2026-08-18T06:55:00Z', status: 'Disabled' },
  { id: 'emp-006', name: 'Emily Chen', department: 'Finance', email: 'emily.chen@company.com', openIssues: 2, resolvedIssues: 11, lastActivity: '2026-08-18T09:02:00Z', status: 'Active' },
];

export const technicians = [
  { id: 'tech-001', name: 'Ahmad Khan', role: 'Senior IT Technician', specialization: 'Networking', openIssues: 5, solvedIssues: 42, avgResolution: '1h 24m', avgResponse: '18m', rating: 4.8, sla: 96, status: 'Available' },
  { id: 'tech-002', name: 'Usman Tariq', role: 'IT Technician', specialization: 'Hardware', openIssues: 3, solvedIssues: 31, avgResolution: '2h 05m', avgResponse: '24m', rating: 4.6, sla: 91, status: 'Busy' },
  { id: 'tech-003', name: 'Sana Iqbal', role: 'IT Technician', specialization: 'Software & Accounts', openIssues: 4, solvedIssues: 37, avgResolution: '1h 48m', avgResponse: '20m', rating: 4.7, sla: 94, status: 'Available' },
  { id: 'tech-004', name: 'David Kim', role: 'Junior IT Technician', specialization: 'Endpoint Support', openIssues: 2, solvedIssues: 19, avgResolution: '2h 30m', avgResponse: '31m', rating: 4.4, sla: 87, status: 'Away' },
  { id: 'tech-005', name: 'Zainab Sheikh', role: 'IT Technician', specialization: 'Security', openIssues: 1, solvedIssues: 25, avgResolution: '1h 12m', avgResponse: '15m', rating: 4.9, sla: 98, status: 'Offline' },
];
