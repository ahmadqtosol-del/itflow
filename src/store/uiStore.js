import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  commandPaletteOpen: false,
  quickCreateOpen: false,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickCreateOpen: (open) => set({ quickCreateOpen: open }),

  pushToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { id: Date.now() + Math.random(), ...toast }],
    })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
