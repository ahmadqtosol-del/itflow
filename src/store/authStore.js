import { create } from 'zustand';
import { apiClient } from '../services/api/client';

const TOKEN_KEY = 'itflow_auth_token';
const USER_KEY = 'itflow_auth_user';

function getPersistedAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      return { token, user: JSON.parse(userJson) };
    }
  } catch {
    // ignore
  }
  return null;
}

function persistAuth(token, user) {
  try {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

const persisted = getPersistedAuth();

export const useAuthStore = create((set) => ({
  user: persisted?.user || null,
  token: persisted?.token || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const user = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: res.user.role,
        department: res.user.department,
        avatarColor: res.user.avatar_color || res.user.avatarColor || '#3b82f6',
        status: res.user.status,
      };

      persistAuth(res.token, user);
      set({ user, token: res.token, loading: false });
      return user;
    } catch (err) {
      set({ loading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  logout: () => {
    persistAuth(null, null);
    set({ user: null, token: null, error: null });
  },
}));
