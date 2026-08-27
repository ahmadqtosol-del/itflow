import { apiClient } from './client';

export const auditService = {
  async list(category = '') {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await apiClient.get(`/audit-logs${query}`);
    return Array.isArray(res)
      ? res.map((l) => ({
          id: l.id,
          actor: l.actor_label,
          action: l.action,
          target: l.target,
          category: l.category,
          time: l.created_at,
        }))
      : [];
  },
};
