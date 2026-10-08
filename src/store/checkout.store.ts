import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Address, Serviceability } from '@/types';

/**
 * Checkout draft — survives a reload mid-checkout but is cleared when the tab closes
 * (sessionStorage), so a shared device never carries another person's address forward.
 */
interface CheckoutState {
  address?: Address;
  /** where order updates go; defaults to the login mobile, may differ (journey rule) */
  updatesMobile?: string;
  language: 'ta' | 'en';
  express: boolean;
  serviceability?: Serviceability;
  setAddress: (a: Address, s?: Serviceability) => void;
  setUpdates: (mobile: string, language: 'ta' | 'en') => void;
  setExpress: (v: boolean) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      address: undefined,
      updatesMobile: undefined,
      language: 'ta',
      express: false,
      serviceability: undefined,
      setAddress: (address, serviceability) => set({ address, serviceability }),
      setUpdates: (updatesMobile, language) => set({ updatesMobile, language }),
      setExpress: (express) => set({ express }),
      reset: () => set({ address: undefined, updatesMobile: undefined, express: false, serviceability: undefined }),
    }),
    { name: 'vighan.checkout.v1', storage: createJSONStorage(() => sessionStorage) },
  ),
);
