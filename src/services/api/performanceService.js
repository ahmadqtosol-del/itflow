import { apiClient } from './client';
import {
  resolutionByTech,
  responseByTech,
  satisfactionTrend,
  monthlyVolume,
  categoryBreakdown,
} from '../../mock/performance';

export const performanceService = {
  async getDashboardTrend(days = 7) {
    try {
      const res = await apiClient.get(`/dashboard/trend?days=${days}`);
      if (Array.isArray(res)) {
        return res.map((p) => ({ day: p.label, created: p.created, resolved: p.resolved }));
      }
    } catch (e) {
      console.warn('Dashboard trend API fallback:', e);
    }
    return [
      { day: 'Mon', created: 14, resolved: 11 },
      { day: 'Tue', created: 18, resolved: 15 },
      { day: 'Wed', created: 9, resolved: 13 },
      { day: 'Thu', created: 21, resolved: 17 },
      { day: 'Fri', created: 16, resolved: 19 },
      { day: 'Sat', created: 5, resolved: 6 },
      { day: 'Sun', created: 3, resolved: 4 },
    ];
  },

  async getTechnicianCharts(days = 30) {
    try {
      const res = await apiClient.get(`/dashboard/performance?days=${days}`);
      if (res && res.charts) {
        return res;
      }
    } catch (e) {
      console.warn('Performance charts API error:', e);
    }
    return {
      stats: {
        tasks_solved: 0,
        avg_response: '0m',
        avg_resolution: '0m',
        avg_rating: 0,
        sla_success: 0,
      },
      charts: {
        resolutionByTech: [],
        satisfactionTrend: [],
        categoryBreakdown: [],
      },
    };
  },
};
