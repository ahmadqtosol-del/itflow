import { create } from 'zustand';


export const useUiStore = create((set) => ({
  sidebarCollapsed: false,

  theme: 'dark',

  commandPaletteOpen: false,

  quickCreateOpen: false,

  toasts: [],


  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed:
        !state.sidebarCollapsed,
    })),


  setTheme: (theme) =>
    set({
      theme:
        theme === 'light'
          ? 'light'
          : 'dark',
    }),


  toggleTheme: () =>
    set((state) => ({
      theme:
        state.theme === 'dark'
          ? 'light'
          : 'dark',
    })),


  setCommandPaletteOpen: (open) =>
    set({
      commandPaletteOpen: open,
    }),


  setQuickCreateOpen: (open) =>
    set({
      quickCreateOpen: open,
    }),


  pushToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id:
            Date.now() +
            Math.random(),

          ...toast,
        },
      ],
    })),


  dismissToast: (id) =>
    set((state) => ({
      toasts:
        state.toasts.filter(
          (toast) =>
            toast.id !== id
        ),
    })),
}));
