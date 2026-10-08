/**
 * API layer. Every screen talks to these functions only, never to data files directly,
 * so swapping the mock adapter for a real backend is a one-file change per domain.
 *
 * With VITE_USE_MOCK_API=true (default) the functions resolve from the in-memory
 * catalogue with realistic latency. Set it to false and point VITE_API_BASE_URL at
 * your backend: each function then calls `http()` with the same return shapes.
 */
import { site } from '@/config/site';
import { sleep } from '@/lib/utils';
import { categories, featuredCategorySlugs, products, reviews } from '@/data/catalogue';
import type { BatchReport, Category, CategorySlug, Product, Review, Serviceability } from '@/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

const latency = () => sleep(220 + Math.random() * 380);

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${site.apiBaseUrl}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) throw new ApiError(await res.text(), res.status);
  return res.json() as Promise<T>;
}

export interface ProductQuery {
  category?: CategorySlug | 'all';
  search?: string;
  tags?: string[];
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'newest';
  /** Restrict to shelves we have pouch photography for — what the home rails show. */
  featuredOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

const priceOf = (p: Product) => p.skus.find((s) => s.id === p.defaultSku)?.price ?? 0;

export const productsApi = {
  async list(q: ProductQuery = {}): Promise<Paged<Product>> {
    if (!site.useMockApi) return http(`/products?${new URLSearchParams(q as Record<string, string>)}`);
    await latency();
    let items = [...products];
    // "New launches" used to be a pseudo-category; it is a sort now, so this is a plain match.
    if (q.category && q.category !== 'all') items = items.filter((p) => p.category === q.category);
    // Keeps scaffold pantry items out of the home rails without hiding them from /shop.
    if (q.featuredOnly) items = items.filter((p) => (featuredCategorySlugs as string[]).includes(p.category));
    if (q.search) {
      const s = q.search.toLowerCase();
      items = items.filter((p) => [p.name, p.descriptor, p.benefit, p.category].join(' ').toLowerCase().includes(s));
    }
    if (q.tags?.length) items = items.filter((p) => q.tags!.every((t) => p.tags.includes(t) || (t === 'no-sugar' && /no added sugar/i.test(p.bullets.join(' ')))));
    switch (q.sort) {
      case 'price-asc':
        items.sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case 'price-desc':
        items.sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case 'newest':
        items.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        break;
      default:
        items.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  },

  async get(slug: string): Promise<Product> {
    if (!site.useMockApi) return http(`/products/${slug}`);
    await latency();
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new ApiError('Product not found', 404);
    return p;
  },

  async related(slug: string, limit = 4): Promise<Product[]> {
    if (!site.useMockApi) return http(`/products/${slug}/related`);
    await sleep(150);
    const p = products.find((x) => x.slug === slug);
    return products.filter((x) => x.slug !== slug && (x.category === p?.category || x.isKit)).slice(0, limit);
  },

  async reviews(_slug: string): Promise<Review[]> {
    if (!site.useMockApi) return http(`/products/${_slug}/reviews`);
    await sleep(200);
    return reviews;
  },

  async categories(): Promise<Category[]> {
    if (!site.useMockApi) return http('/categories');
    return categories;
  },

  async suggest(term: string): Promise<Product[]> {
    if (!term.trim()) return [];
    if (!site.useMockApi) return http(`/products/suggest?q=${encodeURIComponent(term)}`);
    await sleep(120);
    const s = term.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(s) || p.descriptor.toLowerCase().includes(s)).slice(0, 5);
  },
};

/** Serviceability — mock table by pincode prefix. Replace with your courier's API. */
export const serviceabilityApi = {
  async check(pincode: string): Promise<Serviceability> {
    if (!site.useMockApi) return http(`/serviceability/${pincode}`);
    await latency();
    if (!/^[1-9]\d{5}$/.test(pincode)) return { pincode, serviceable: false, reason: 'Enter a valid 6-digit pincode' };
    const p3 = pincode.slice(0, 3);
    const chennai: Record<string, string> = { '600042': 'Velachery', '600004': 'Mylapore', '600020': 'Adyar', '600001': 'Parrys', '601201': 'Gummidipoondi' };
    if (pincode.startsWith('600') || pincode.startsWith('601') || pincode.startsWith('602') || pincode.startsWith('603'))
      return { pincode, serviceable: true, area: chennai[pincode] ?? 'Chennai', city: 'Chennai', state: 'Tamil Nadu', standardDays: [2, 3], expressAvailable: true, codAvailable: true };
    if (['60', '61', '62', '63', '64'].some((x) => pincode.startsWith(x)))
      return { pincode, serviceable: true, city: 'Tamil Nadu', state: 'Tamil Nadu', standardDays: [2, 3], expressAvailable: false, codAvailable: true };
    if (p3.startsWith('5') || p3.startsWith('6'))
      return { pincode, serviceable: true, city: 'South India', state: '', standardDays: [3, 5], expressAvailable: false, codAvailable: true };
    if (pincode.startsWith('19') || pincode.startsWith('79'))
      return { pincode, serviceable: false, reason: 'Our courier does not deliver to this pincode yet — WhatsApp us and we will find a way.' };
    return { pincode, serviceable: true, city: 'India', state: '', standardDays: [4, 6], expressAvailable: false, codAvailable: false };
  },
};

export const batchApi = {
  async report(batchId: string): Promise<BatchReport> {
    if (!site.useMockApi) return http(`/batches/${batchId}`);
    await latency();
    const id = batchId.trim().toUpperCase();
    if (!/^B-\d{4}$/.test(id)) throw new ApiError('Batch numbers look like B-0921 — printed near the expiry date.', 400);
    if (!['B-0921', 'B-0917', 'B-0912'].includes(id)) throw new ApiError(`No report found for ${id}. Check the number on your pack or WhatsApp us a photo.`, 404);
    return {
      batchId: id,
      product: 'Sprouted Ragi Malt',
      milled: '2026-09-18',
      packed: '2026-09-20',
      bestBefore: '2027-03-20',
      tests: [
        { name: 'Moisture', result: '[value] %', limit: '≤ 8 %', pass: true },
        { name: 'Protein', result: '[value] g / 100 g', limit: '—', pass: true },
        { name: 'Lead', result: '[value] ppm', limit: '≤ 2.5 ppm', pass: true },
        { name: 'Aflatoxin', result: '[value] ppb', limit: '≤ 15 ppb', pass: true },
      ],
    };
  },
};
