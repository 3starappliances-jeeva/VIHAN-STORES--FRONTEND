import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { site } from '@/config/site';
import { products } from '@/data/catalogue';
import type { CartLine, CartTotals, PaymentMethod, Product, Sku } from '@/types';

export interface Coupon {
  code: string;
  /** percent off items subtotal */
  percent: number;
  maxDiscount?: number;
}

/** Coupons the mock accepts. Replace with a /coupons/validate call. */
export const COUPONS: Record<string, Coupon> = {
  FIRST10: { code: 'FIRST10', percent: 10, maxDiscount: 300 },
  FAMILY5: { code: 'FAMILY5', percent: 5 },
};

interface CartState {
  lines: CartLine[];
  coupon?: Coupon;
  useWallet: boolean;
  walletBalance: number;
  payment: PaymentMethod;
  express: boolean;
  // actions
  add: (productId: string, skuId: string, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  saveForLater: (lineId: string, saved: boolean) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  setUseWallet: (v: boolean) => void;
  setWalletBalance: (v: number) => void;
  setPayment: (m: PaymentMethod) => void;
  setExpress: (v: boolean) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: undefined,
      useWallet: false,
      walletBalance: 0,
      payment: 'upi',
      express: false,

      add: (productId, skuId, qty = 1) =>
        set((s) => {
          const lineId = `${productId}:${skuId}`;
          const existing = s.lines.find((l) => l.lineId === lineId);
          if (existing) return { lines: s.lines.map((l) => (l.lineId === lineId ? { ...l, qty: Math.min(10, l.qty + qty), savedForLater: false } : l)) };
          return { lines: [...s.lines, { lineId, productId, skuId, qty }] };
        }),
      setQty: (lineId, qty) => set((s) => ({ lines: s.lines.map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)) })),
      remove: (lineId) => set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),
      saveForLater: (lineId, saved) => set((s) => ({ lines: s.lines.map((l) => (l.lineId === lineId ? { ...l, savedForLater: saved } : l)) })),
      applyCoupon: (code) => {
        const c = COUPONS[code.trim().toUpperCase()];
        if (!c) return { ok: false, message: 'That code is not valid — check the spelling or try FIRST10.' };
        set({ coupon: c });
        return { ok: true, message: `${c.code} applied — ${c.percent}% off` };
      },
      removeCoupon: () => set({ coupon: undefined }),
      setUseWallet: (useWallet) => set({ useWallet }),
      setWalletBalance: (walletBalance) => set({ walletBalance }),
      setPayment: (payment) => set({ payment }),
      setExpress: (express) => set({ express }),
      clear: () => set({ lines: get().lines.filter((l) => l.savedForLater), coupon: undefined, useWallet: false, express: false }),
    }),
    { name: 'vighan.cart.v1', partialize: (s) => ({ lines: s.lines, coupon: s.coupon, useWallet: s.useWallet, walletBalance: s.walletBalance, payment: s.payment, express: s.express }) },
  ),
);

// ---------- selectors / pure helpers (also unit-tested) ----------

export interface ResolvedLine extends CartLine {
  product: Product;
  sku: Sku;
  variantLabel: string;
}

export const resolveLine = (line: CartLine, catalogue: Product[] = products): ResolvedLine | null => {
  const product = catalogue.find((p) => p.id === line.productId);
  const sku = product?.skus.find((s) => s.id === line.skuId);
  if (!product || !sku) return null;
  const variantLabel = product.steps
    .map((step) => step.options.find((o) => o.id === sku.selection[step.id])?.label)
    .filter(Boolean)
    .join(' · ');
  return { ...line, product, sku, variantLabel };
};

export const resolveLines = (lines: CartLine[], catalogue: Product[] = products): ResolvedLine[] =>
  lines.map((l) => resolveLine(l, catalogue)).filter((x): x is ResolvedLine => !!x);

export interface TotalsInput {
  lines: CartLine[];
  coupon?: Coupon;
  useWallet?: boolean;
  walletBalance?: number;
  payment?: PaymentMethod;
  express?: boolean;
  catalogue?: Product[];
}

export const computeTotals = ({ lines, coupon, useWallet, walletBalance = 0, payment = 'upi', express = false, catalogue = products }: TotalsInput): CartTotals => {
  const active = resolveLines(lines, catalogue).filter((l) => !l.savedForLater);
  const subtotal = active.reduce((sum, l) => sum + l.sku.price * l.qty, 0);
  const mrpTotal = active.reduce((sum, l) => sum + l.sku.mrp * l.qty, 0);
  const itemCount = active.reduce((n, l) => n + l.qty, 0);
  let couponDiscount = coupon ? Math.floor((subtotal * coupon.percent) / 100) : 0;
  if (coupon?.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
  const afterCoupon = subtotal - couponDiscount;
  const freeShippingGap = Math.max(0, site.freeShippingThreshold - afterCoupon);
  const shipping = itemCount === 0 ? 0 : (afterCoupon >= site.freeShippingThreshold ? 0 : 49) + (express ? site.expressFee : 0);
  const codFee = payment === 'cod' && itemCount > 0 ? site.codFee : 0;
  const payable = afterCoupon + shipping + codFee;
  const walletApplied = useWallet && payment !== 'cod' ? Math.min(walletBalance, payable) : 0;
  const total = Math.max(0, payable - walletApplied);
  const gstIncluded = Math.round((afterCoupon - afterCoupon / (1 + site.gstRate)) * 100) / 100;
  return { itemCount, subtotal, mrpTotal, couponDiscount, shipping, codFee, walletApplied, gstIncluded, total, freeShippingGap };
};

/** Hook-friendly selector: totals for the live store state. */
export const useCartTotals = () =>
  useCartStore((s) => computeTotals({ lines: s.lines, coupon: s.coupon, useWallet: s.useWallet, walletBalance: s.walletBalance, payment: s.payment, express: s.express }));

export const useCartCount = () => useCartStore((s) => s.lines.filter((l) => !l.savedForLater).reduce((n, l) => n + l.qty, 0));
