import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge must know our custom scales, otherwise `text-body-1` is mistaken for a
 * text colour and silently drops `text-white` (and `font-med` for a font family).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['caption-1', 'caption-2', 'body-1', 'body-2', 'body-3', 'body-4', 'title-1', 'title-2', 'title-3', 'title-4', 'title-5', 'title-6'] }],
      'font-weight': [{ font: ['reg', 'med', 'bold'] }],
      shadow: [{ shadow: ['1', '2', '3', 'sheet'] }],
      rounded: [{ rounded: ['btn', 'card', 'tile', 'section', 'pill'] }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Locked format: en-IN grouping, symbol tight to digits, no decimals unless needed. */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatINR = (amount: number, decimals = false) => (decimals ? inr2 : inr).format(amount).replace(/\s/g, '');

/** "9% off" — computed, never hand-typed; suppressed when ≤ 0 */
export const percentOff = (price: number, mrp: number) => (mrp > price ? Math.floor((1 - price / mrp) * 100) : 0);

export const perUnit = (price: number, grams: number, per = 100) => `${formatINR(Math.round((price / grams) * per))} / ${per} g`;

export const formatDate = (iso: string, withTime = false) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  if (!withTime) return date;
  return `${date}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
};

export const addDays = (iso: string | Date, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const formatEta = (from: string | Date, days: [number, number]) => {
  const d = new Date(addDays(from, days[1]));
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
};

export const maskMobile = (mobile: string) => {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 2)}••• ••${digits.slice(-3)}` : mobile;
};

export const formatMobile = (mobile: string) => {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : mobile;
};

export const compactCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : String(n));

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const uid = (prefix = '') => `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const isValidIndianMobile = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '').slice(-10));
export const isValidPincode = (v: string) => /^[1-9]\d{5}$/.test(v);
