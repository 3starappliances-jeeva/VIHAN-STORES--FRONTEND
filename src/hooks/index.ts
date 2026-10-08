import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { batchApi, productsApi, serviceabilityApi, type ProductQuery } from '@/services/api';
import { ordersApi, type PlaceOrderInput } from '@/services/orders.api';

export const queryKeys = {
  products: (q: ProductQuery) => ['products', q] as const,
  product: (slug: string) => ['product', slug] as const,
  related: (slug: string) => ['related', slug] as const,
  reviews: (slug: string) => ['reviews', slug] as const,
  categories: ['categories'] as const,
  suggest: (term: string) => ['suggest', term] as const,
  serviceability: (pin: string) => ['serviceability', pin] as const,
  batch: (id: string) => ['batch', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
};

export const useProducts = (q: ProductQuery) => useQuery({ queryKey: queryKeys.products(q), queryFn: () => productsApi.list(q), placeholderData: keepPreviousData, staleTime: 60_000 });
export const useProduct = (slug: string) => useQuery({ queryKey: queryKeys.product(slug), queryFn: () => productsApi.get(slug), staleTime: 5 * 60_000, retry: (n, err) => (err as { status?: number }).status !== 404 && n < 2 });
export const useRelated = (slug: string) => useQuery({ queryKey: queryKeys.related(slug), queryFn: () => productsApi.related(slug), staleTime: 5 * 60_000 });
export const useReviews = (slug: string) => useQuery({ queryKey: queryKeys.reviews(slug), queryFn: () => productsApi.reviews(slug), staleTime: 5 * 60_000 });
export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: () => productsApi.categories(), staleTime: Infinity });
export const useSuggest = (term: string) => useQuery({ queryKey: queryKeys.suggest(term), queryFn: () => productsApi.suggest(term), enabled: term.trim().length >= 2 });
export const useServiceability = (pin: string | undefined) =>
  useQuery({ queryKey: queryKeys.serviceability(pin ?? ''), queryFn: () => serviceabilityApi.check(pin!), enabled: !!pin && /^\d{6}$/.test(pin), staleTime: 10 * 60_000 });
export const useBatchReport = () => useMutation({ mutationFn: (id: string) => batchApi.report(id) });

export const useOrders = (enabled = true) => useQuery({ queryKey: queryKeys.orders, queryFn: () => ordersApi.list(), enabled });
export const useOrder = (id: string | undefined) => useQuery({ queryKey: queryKeys.order(id ?? ''), queryFn: () => ordersApi.get(id!), enabled: !!id, retry: false });
export const usePlaceOrder = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: PlaceOrderInput) => ordersApi.place(input), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }) });
};
export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: (o) => {
      qc.setQueryData(queryKeys.order(o.id), o);
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};
export const useAdvanceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.advance(id),
    onSuccess: (o) => {
      qc.setQueryData(queryKeys.order(o.id), o);
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};
export const useTrackOrder = () => useMutation({ mutationFn: ({ id, mobile }: { id: string; mobile: string }) => ordersApi.track(id, mobile) });

// ---------- generic ----------
export const useDebounce = <T,>(value: T, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatches(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return matches;
};

export const useCountdown = (seconds: number, key: unknown) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds, key]);
  return left;
};

/** Lock body scroll while a drawer/modal is open. */
export const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
};

/** Trap focus inside a container and restore it on close. */
export const useFocusTrap = (active: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const first = root.querySelector<HTMLElement>(selector);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((n) => n.offsetParent !== null);
      if (!nodes.length) return;
      const a = nodes[0];
      const z = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [active]);
  return ref;
};
