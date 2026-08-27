import { create } from 'zustand';
import { settingsService } from '../services/api/settingsService';

/**
 * Global store for SLA Rules, Categories, and Departments.
 * These three resources are the single source of truth pulled from FastAPI.
 * Any component that needs a category/department list reads from here
 * instead of the mock files, so mutations in AdminSettings propagate
 * everywhere immediately without a page reload.
 */
export const useSettingsStore = create((set, get) => ({
  // --- State ---
  slaRules: [],
  categories: [],
  departments: [],

  slaLoading: false,
  categoriesLoading: false,
  departmentsLoading: false,

  slaError: null,
  categoriesError: null,
  departmentsError: null,

  // --- SLA Rules ---
  fetchSlaRules: async () => {
    set({ slaLoading: true, slaError: null });
    try {
      const data = await settingsService.listSlaRules();
      set({ slaRules: Array.isArray(data) ? data : [], slaLoading: false });
    } catch (err) {
      set({ slaError: err.message || 'Failed to load SLA rules', slaLoading: false });
    }
  },

  createSlaRule: async (payload) => {
    const data = await settingsService.createSlaRule(payload);
    set((s) => ({ slaRules: [...s.slaRules, data] }));
    return data;
  },

  updateSlaRule: async (id, payload) => {
    const data = await settingsService.updateSlaRule(id, payload);
    set((s) => ({
      slaRules: s.slaRules.map((r) => (r.id === id ? data : r)),
    }));
    return data;
  },

  deleteSlaRule: async (id) => {
    await settingsService.deleteSlaRule(id);
    set((s) => ({ slaRules: s.slaRules.filter((r) => r.id !== id) }));
  },

  // --- Categories ---
  fetchCategories: async () => {
    set({ categoriesLoading: true, categoriesError: null });
    try {
      const data = await settingsService.listCategories();
      set({ categories: Array.isArray(data) ? data : [], categoriesLoading: false });
    } catch (err) {
      set({ categoriesError: err.message || 'Failed to load categories', categoriesLoading: false });
    }
  },

  createCategory: async (payload) => {
    const data = await settingsService.createCategory(payload);
    set((s) => ({ categories: [...s.categories, data] }));
    return data;
  },

  updateCategory: async (id, payload) => {
    const data = await settingsService.updateCategory(id, payload);
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? data : c)),
    }));
    return data;
  },

  deleteCategory: async (id) => {
    await settingsService.deleteCategory(id);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  // --- Departments ---
  fetchDepartments: async () => {
    set({ departmentsLoading: true, departmentsError: null });
    try {
      const data = await settingsService.listDepartments();
      set({ departments: Array.isArray(data) ? data : [], departmentsLoading: false });
    } catch (err) {
      set({ departmentsError: err.message || 'Failed to load departments', departmentsLoading: false });
    }
  },

  createDepartment: async (payload) => {
    const data = await settingsService.createDepartment(payload);
    set((s) => ({ departments: [...s.departments, data] }));
    return data;
  },

  updateDepartment: async (id, payload) => {
    const data = await settingsService.updateDepartment(id, payload);
    set((s) => ({
      departments: s.departments.map((d) => (d.id === id ? data : d)),
    }));
    return data;
  },

  deleteDepartment: async (id) => {
    await settingsService.deleteDepartment(id);
    set((s) => ({ departments: s.departments.filter((d) => d.id !== id) }));
  },

  // Convenience: returns just the category name strings for <select> options
  getCategoryNames: () => get().categories.map((c) => c.name),
  getDepartmentNames: () => get().departments.map((d) => d.name),
}));
