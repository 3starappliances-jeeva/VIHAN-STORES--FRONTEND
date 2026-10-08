import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatINR } from '@/lib/utils';
import { resolveLines, useCartStore, useCartTotals } from '@/store/cart.store';
import { OrderSummary, StepHeader, type CheckoutStep } from '@/components/commerce';
import { ClayThumb } from '@/components/ui';

/** Two-column checkout frame: step header, form column, sticky order summary with the items. */
export const CheckoutShell = ({ step, title, children, aside }: { step: CheckoutStep; title: string; children: ReactNode; aside?: ReactNode }) => {
  const { t } = useTranslation();
  const lines = useCartStore((s) => s.lines);
  const totals = useCartTotals();
  const items = resolveLines(lines).filter((l) => !l.savedForLater);
  return (
    <div className="page pb-10 pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StepHeader current={step} />
        <p className="inline-flex items-center gap-1.5 text-caption-2 text-muted">
          <Lock size={14} aria-hidden /> {t('trust.secure')}
        </p>
      </div>
      <h1 className="mt-5 text-title-3 font-med text-heading md:text-title-4">{title}</h1>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_380px]">
        <div>{children}</div>
        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--vc-header-h)+16px)] lg:self-start">
          <section className="card p-4" aria-label={t('checkout.summary')}>
            <div className="flex items-center justify-between">
              <h2 className="text-body-1 font-med text-heading">{t('checkout.summary')}</h2>
              <Link to="/cart" className="text-caption-2 font-med text-brand hover:underline">
                {t('checkout.editCart')}
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {items.map((l) => (
                <li key={l.lineId} className="flex items-center gap-3 py-2.5">
                  <ClayThumb image={l.product.image} glyph={l.product.glyph} tone={l.product.tone} className="h-12 w-12" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption-2 font-med text-ink">{l.product.name}</span>
                    <span className="block text-caption-1 text-muted">{l.variantLabel} × {l.qty}</span>
                  </span>
                  <span className="tabular text-caption-2 font-med text-ink">{formatINR(l.sku.price * l.qty)}</span>
                </li>
              ))}
            </ul>
          </section>
          <OrderSummary totals={totals} coupon={step === 'address'} />
          {aside}
        </aside>
      </div>
    </div>
  );
};
