import { create } from 'zustand';

interface AdminState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  notificationsCount: number;
  incrementNotifications: () => void;
  clearNotifications: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  sidebarOpen: true, // Desktop default
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  notificationsCount: 3, // Mock default
  incrementNotifications: () => set((state) => ({ notificationsCount: state.notificationsCount + 1 })),
  clearNotifications: () => set({ notificationsCount: 0 }),
}));
