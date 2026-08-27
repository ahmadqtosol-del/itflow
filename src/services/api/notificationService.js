import { apiClient } from './client';

export const notificationService = {
  async list() {
    const res = await apiClient.get('/notifications');
    return Array.isArray(res)
      ? res.map((n) => ({
          id: n.id,
          category: n.category,
          title: n.title,
          read: n.read,
          time: n.created_at,
          relatedIssueId: n.related_issue_id,
        }))
      : [];
  },

  async markAllRead() {
    const res = await apiClient.post('/notifications/read-all', {});
    return res?.ok ?? true;
  },
};
