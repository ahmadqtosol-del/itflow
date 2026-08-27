import { apiClient } from './client';

function adaptUser(u) {
  if (!u) return null;
  return {
    ...u,
    avatarColor: u.avatar_color || u.avatarColor || '#3b82f6',
    openIssues: u.open_issues ?? u.openIssues ?? 0,
    resolvedIssues: u.resolved_issues ?? u.resolvedIssues ?? 0,
    solvedIssues: u.solved_issues ?? u.solvedIssues ?? 0,
    lastActivity: u.last_activity || u.lastActivity || null,
    avgResolution: u.avg_resolution ?? u.avgResolution ?? '0m',
    avgResponse: u.avg_response ?? u.avgResponse ?? '0m',
    rating: u.rating ?? 0,
    sla: u.sla_success_rate ?? u.sla ?? 0,
  };
}

export const userService = {
  async listEmployees() {
    const res = await apiClient.get('/employees');
    return Array.isArray(res) ? res.map(adaptUser) : [];
  },

  async listTechnicians(days) {
    const query = days ? `?days=${days}` : '';
    const res = await apiClient.get(`/technicians${query}`);
    return Array.isArray(res) ? res.map(adaptUser) : [];
  },

  async getCurrentUser() {
    const res = await apiClient.get('/users/me');
    return adaptUser(res);
  },

  async updateEmployee(userId, payload) {
    const res = await apiClient.patch(`/employees/${userId}`, payload);
    return adaptUser(res);
  },

  async createEmployee(payload) {
    const res = await apiClient.post('/employees', payload);
    return adaptUser(res);
  },

  async deleteEmployee(userId) {
    // Backend performs soft-delete (sets status=Disabled) when issues exist,
    // or hard-delete when no issues reference the employee.
    const res = await apiClient.delete(`/employees/${userId}`);
    return res ? adaptUser(res) : null;
  },
};
