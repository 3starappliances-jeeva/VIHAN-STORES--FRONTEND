import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address, Customer } from '@/types';
import { uid } from '@/lib/utils';

interface AuthState {
  token?: string;
  customer?: Customer;
  addresses: Address[];
  /** where to return after login (e.g. /checkout) */
  returnTo?: string;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
  updateCustomer: (patch: Partial<Customer>) => void;
  addAddress: (a: Omit<Address, 'id'>) => Address;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setReturnTo: (path?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: undefined,
      customer: undefined,
      addresses: [],
      returnTo: undefined,
      login: (token, customer) => set({ token, customer }),
      logout: () => set({ token: undefined, customer: undefined }),
      updateCustomer: (patch) => set((s) => ({ customer: s.customer ? { ...s.customer, ...patch } : s.customer })),
      addAddress: (a) => {
        const address: Address = { ...a, id: uid('adr_'), isDefault: get().addresses.length === 0 || a.isDefault };
        set((s) => ({ addresses: [...s.addresses.map((x) => (address.isDefault ? { ...x, isDefault: false } : x)), address] }));
        return address;
      },
      removeAddress: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      setDefaultAddress: (id) => set((s) => ({ addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })) })),
      setReturnTo: (returnTo) => set({ returnTo }),
    }),
    { name: 'vighan.auth.v1' },
  ),
);

export const useIsLoggedIn = () => useAuthStore((s) => !!s.token);
