/**
 * Analytics façade. Wire `send` to GA4 / Meta Pixel / your warehouse — screens only
 * ever call `track()`, so the vendor can change without touching UI code.
 */
export type AnalyticsEvent =
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'
  | 'login'
  | 'search'
  | 'select_promotion'
  | 'cancel_order';

type Props = Record<string, string | number | boolean | undefined>;

const listeners: ((e: AnalyticsEvent, p: Props) => void)[] = [];

export const onTrack = (fn: (e: AnalyticsEvent, p: Props) => void) => {
  listeners.push(fn);
  return () => listeners.splice(listeners.indexOf(fn), 1);
};

export const track = (event: AnalyticsEvent, props: Props = {}) => {
  if (import.meta.env.DEV) console.debug('[analytics]', event, props);
  for (const fn of listeners) fn(event, props);
};
