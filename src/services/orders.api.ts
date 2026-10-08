/**
 * Orders. Mock adapter persists to localStorage so the flow survives reloads
 * (place → confirm → track → cancel). Real backend: same shapes over /orders.
 */
import { site } from '@/config/site';
import { http, ApiError } from './api';
import { addDays, sleep } from '@/lib/utils';
import type { Address, CartTotals, Order, OrderItem, OrderStatus, PaymentMethod } from '@/types';

const KEY = 'vighan.orders.v1';

const read = (): Order[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Order[];
  } catch {
    return [];
  }
};
const write = (orders: Order[]) => localStorage.setItem(KEY, JSON.stringify(orders));

const nextId = (orders: Order[]) => {
  const n = 1834 + orders.length;
  return `ORD-26-${String(n).padStart(5, '0')}`;
};

export interface PlaceOrderInput {
  items: OrderItem[];
  totals: CartTotals;
  address: Address;
  payment: { method: PaymentMethod; reference?: string };
  updatesMobile: string;
  language: 'ta' | 'en';
  standardDays: [number, number];
  express?: boolean;
}

export const ordersApi = {
  async place(input: PlaceOrderInput): Promise<Order> {
    if (!site.useMockApi) return http('/orders', { method: 'POST', body: JSON.stringify(input) });
    await sleep(900);
    const orders = read();
    const now = new Date().toISOString();
    const eta = input.express ? [1, 1] : input.standardDays;
    const order: Order = {
      id: nextId(orders),
      placedAt: now,
      status: 'confirmed',
      statusHistory: [
        { status: 'placed', at: now },
        { status: 'confirmed', at: new Date(Date.now() + 60_000).toISOString() },
      ],
      items: input.items,
      totals: input.totals,
      address: input.address,
      payment: { method: input.payment.method, reference: input.payment.reference, captured: input.payment.method !== 'cod' },
      updatesMobile: input.updatesMobile,
      language: input.language,
      courier: { name: input.express ? 'Delhivery Express' : 'Delhivery Surface', eta: addDays(now, eta[1]) },
      cancellable: true,
    };
    write([order, ...orders]);
    return order;
  },

  async list(): Promise<Order[]> {
    if (!site.useMockApi) return http('/orders');
    await sleep(300);
    return read();
  },

  async get(id: string): Promise<Order> {
    if (!site.useMockApi) return http(`/orders/${id}`);
    await sleep(300);
    const o = read().find((x) => x.id.toUpperCase() === id.trim().toUpperCase());
    if (!o) throw new ApiError('We could not find that order. Check the number in your confirmation message.', 404);
    return o;
  },

  /** Guest tracking: order number + the mobile used for updates. Only delivery status is shown. */
  async track(id: string, mobile: string): Promise<Order> {
    if (!site.useMockApi) return http(`/orders/track`, { method: 'POST', body: JSON.stringify({ id, mobile }) });
    const o = await this.get(id);
    if (o.updatesMobile.slice(-10) !== mobile.replace(/\D/g, '').slice(-10)) throw new ApiError('That mobile number does not match this order.', 403);
    return o;
  },

  /** Self-cancellation is allowed only before "preparing" (business rule BR-41/48/84). */
  async cancel(id: string): Promise<Order> {
    if (!site.useMockApi) return http(`/orders/${id}/cancel`, { method: 'POST' });
    await sleep(600);
    const orders = read();
    const o = orders.find((x) => x.id === id);
    if (!o) throw new ApiError('Order not found', 404);
    if (!o.cancellable || !['placed', 'confirmed'].includes(o.status)) throw new ApiError('The cancellation window has closed — this order is already being prepared. Report an issue instead.', 409);
    o.status = 'cancelled';
    o.cancellable = false;
    o.statusHistory.push({ status: 'cancelled', at: new Date().toISOString() });
    write(orders);
    return o;
  },

  /** Demo helper: advance an order so the timeline can be explored. */
  async advance(id: string): Promise<Order> {
    const flow: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'packed', 'shipped', 'delivered'];
    const orders = read();
    const o = orders.find((x) => x.id === id);
    if (!o) throw new ApiError('Order not found', 404);
    const i = flow.indexOf(o.status);
    if (i < 0 || i === flow.length - 1) return o;
    o.status = flow[i + 1];
    o.cancellable = ['placed', 'confirmed'].includes(o.status);
    if (o.status === 'packed' && o.courier) o.courier.awb = `DL${Math.floor(Math.random() * 1e12)}`;
    o.statusHistory.push({ status: o.status, at: new Date().toISOString() });
    write(orders);
    return o;
  },
};
