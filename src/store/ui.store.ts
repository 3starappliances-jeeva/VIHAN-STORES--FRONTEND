import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid } from '@/lib/utils';

export type ToastTone = 'success' | 'info' | 'warning' | 'danger';
export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface UiState {
  cartOpen: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  announcementDismissed: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  setMobileNav: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  dismissAnnouncement: () => void;
  toast: (t: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cartOpen: false,
      mobileNavOpen: false,
      searchOpen: false,
      announcementDismissed: false,
      toasts: [],
      openCart: () => set({ cartOpen: true, mobileNavOpen: false, toasts: [] }),
      closeCart: () => set({ cartOpen: false }),
      setMobileNav: (mobileNavOpen) => set({ mobileNavOpen, cartOpen: false }),
      setSearch: (searchOpen) => set({ searchOpen }),
      dismissAnnouncement: () => set({ announcementDismissed: true }),
      toast: (t) => {
        const id = uid('t_');
        set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] })); // max 3 visible
        return id;
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'vighan.ui.v1', partialize: (s) => ({ announcementDismissed: s.announcementDismissed }) },
  ),
);

export const toast = (t: Omit<Toast, 'id'>) => useUiStore.getState().toast(t);
