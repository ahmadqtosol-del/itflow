import { apiClient } from './client';

// --- SLA Rules ---
export const settingsService = {
  // SLA Rules
  async listSlaRules() {
    return apiClient.get('/settings/sla-rules');
  },
  async createSlaRule(payload) {
    return apiClient.post('/settings/sla-rules', payload);
  },
  async updateSlaRule(id, payload) {
    return apiClient.put(`/settings/sla-rules/${id}`, payload);
  },
  async deleteSlaRule(id) {
    return apiClient.delete(`/settings/sla-rules/${id}`);
  },

  // Issue Categories
  async listCategories() {
    return apiClient.get('/settings/categories');
  },
  async createCategory(payload) {
    return apiClient.post('/settings/categories', payload);
  },
  async updateCategory(id, payload) {
    return apiClient.put(`/settings/categories/${id}`, payload);
  },
  async deleteCategory(id) {
    return apiClient.delete(`/settings/categories/${id}`);
  },

  // Departments
  async listDepartments() {
    return apiClient.get('/settings/departments');
  },
  async createDepartment(payload) {
    return apiClient.post('/settings/departments', payload);
  },
  async updateDepartment(id, payload) {
    return apiClient.put(`/settings/departments/${id}`, payload);
  },
  async deleteDepartment(id) {
    return apiClient.delete(`/settings/departments/${id}`);
  },
};
