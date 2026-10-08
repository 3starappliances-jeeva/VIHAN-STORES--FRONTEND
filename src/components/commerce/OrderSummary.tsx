import { useState, type FormEvent, type ReactNode } from 'react';
import { Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatINR } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useCartStore } from '@/store/cart.store';
import { Button, Input } from '@/components/ui';
import type { CartTotals } from '@/types';

export interface OrderSummaryProps {
  totals: CartTotals;
  /** allow coupon entry */
  coupon?: boolean;
  className?: string;
  title?: string;
  children?: ReactNode;
}

/** Price breakdown (reference: "Price details" card) — every line computed, nothing hand-typed. */
export const OrderSummary = ({ totals, coupon = true, className, title, children }: OrderSummaryProps) => {
  const { t } = useTranslation();
  const applied = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const r = applyCoupon(code);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) {
      track('select_promotion', { code: code.toUpperCase() });
      setCode('');
    }
  };

  const Row = ({ label, value, muted, strong, success }: { label: ReactNode; value: ReactNode; muted?: boolean; strong?: boolean; success?: boolean }) => (
    <div className={cn('flex items-center justify-between gap-3 text-body-1', muted && 'text-muted', strong && 'text-title-1 font-med text-ink', success && 'text-success-text')}>
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );

  return (
    <section className={cn('card p-4 sm:p-5', className)} aria-label={title ?? t('cart.priceDetails')}>
      <h2 className="text-body-1 font-med text-heading">{title ?? t('cart.priceDetails')}</h2>

      {coupon && (
        <div className="mt-4">
          {applied ? (
            <div className="flex items-center justify-between gap-2 rounded-card border border-success-line bg-success-bg px-3 py-2 text-caption-2 text-success-text">
              <span className="inline-flex items-center gap-2 font-med">
                <Tag size={14} aria-hidden /> {applied.code} applied · {applied.percent}% off
              </span>
              <button type="button" onClick={() => { removeCoupon(); setMsg(undefined); }} className="grid h-7 w-7 place-items-center rounded-btn hover:bg-white/60" aria-label="Remove coupon">
                <X size={14} aria-hidden />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex items-start gap-2" noValidate>
              <Input aria-label={t('cart.coupon')} placeholder={t('cart.coupon')} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="flex-1" error={msg && !msg.ok ? msg.text : undefined} autoCapitalize="characters" />
              <Button type="submit" variant="outline" disabled={!code.trim()}>
                {t('cart.apply')}
              </Button>
            </form>
          )}
          {!applied && !msg && <p className="mt-1.5 text-caption-1 text-subtle">Try FIRST10 for 10% off your first order</p>}
        </div>
      )}

      <div className="mt-4 space-y-2.5 border-t border-line pt-4">
        <Row label={t('cart.subtotal', { count: totals.itemCount })} value={formatINR(totals.mrpTotal)} />
        {totals.mrpTotal > totals.subtotal && <Row label="Discount on MRP" value={`− ${formatINR(totals.mrpTotal - totals.subtotal)}`} success />}
        {totals.couponDiscount > 0 && <Row label={t('cart.couponLine', { code: applied?.code })} value={`− ${formatINR(totals.couponDiscount)}`} success />}
        <Row label={t('cart.shipping')} value={totals.shipping === 0 ? <span className="font-med text-success-text">{t('cart.free')}</span> : formatINR(totals.shipping)} />
        {totals.codFee > 0 && <Row label={t('cart.codFee')} value={formatINR(totals.codFee)} />}
        {totals.walletApplied > 0 && <Row label={t('cart.wallet')} value={`− ${formatINR(totals.walletApplied)}`} success />}
        <Row label={t('cart.gst')} value={formatINR(totals.gstIncluded, true)} muted />
        <div className="border-t border-line pt-3">
          <Row label={t('cart.total')} value={formatINR(totals.total)} strong />
          {totals.mrpTotal - totals.subtotal + totals.couponDiscount > 0 && (
            <p className="mt-1 text-caption-2 font-med text-success-text">You save {formatINR(totals.mrpTotal - totals.subtotal + totals.couponDiscount)} on this order</p>
          )}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
};
