import { apiClient } from './client';

function formatMinutes(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export const dashboardService = {
  async getAdminSummary() {
    const res = await apiClient.get('/dashboard/admin-summary');
    return {
      totalIssues: res.total_issues ?? 0,
      open: res.open ?? 0,
      inProgress: res.in_progress ?? 0,
      critical: res.critical ?? 0,
      resolvedToday: res.resolved_today ?? 0,
      avgResolution: formatMinutes(res.avg_resolution_minutes),
    };
  },

  async getEmployeeSummary() {
    const res = await apiClient.get('/dashboard/employee-summary');
    return {
      open: res.open ?? 0,
      inProgress: res.in_progress ?? 0,
      waiting: res.waiting ?? 0,
      resolved: res.resolved ?? 0,
    };
  },

  async getTrend(days = 7) {
    const res = await apiClient.get(`/dashboard/trend?days=${days}`);
    return Array.isArray(res) ? res.map((p) => ({ day: p.label, created: p.created, resolved: p.resolved })) : [];
  },
};
