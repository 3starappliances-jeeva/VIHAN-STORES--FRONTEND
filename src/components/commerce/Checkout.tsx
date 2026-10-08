import type { ReactNode } from 'react';
import { Ban, Check, ChevronDown, CreditCard, Landmark, QrCode, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatINR } from '@/lib/utils';
import { site } from '@/config/site';
import type { PaymentMethod } from '@/types';
import { PayMark, type PayMarkId } from './PayMarks';

/* ---------- step header ---------- */
const stepIds = ['cart', 'address', 'payment', 'done'] as const;
export type CheckoutStep = (typeof stepIds)[number];

export const StepHeader = ({ current, className }: { current: CheckoutStep; className?: string }) => {
  const { t } = useTranslation();
  const idx = stepIds.indexOf(current);
  return (
    <ol className={cn('flex items-center gap-2 text-caption-2', className)} aria-label="Checkout progress">
      {stepIds.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span className={cn('grid h-6 w-6 place-items-center rounded-full text-caption-1 font-med', done ? 'bg-brand text-white' : active ? 'bg-ink text-white' : 'bg-surface-2 text-muted')} aria-hidden>
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={cn('hidden sm:inline', active ? 'font-med text-ink' : done ? 'text-ink' : 'text-muted')}>{t(`checkout.steps.${s}`)}</span>
            {i < stepIds.length - 1 && <span className={cn('h-px w-6 sm:w-10', done ? 'bg-brand' : 'bg-surface-2')} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
};

/* ---------- payment methods ---------- */
export type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'other';

export interface PaymentMethodListProps {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  codAvailable?: boolean;
  /** Payable if the order is prepaid — no COD handling fee. */
  prepaidTotal: number;
  /** Payable on cash on delivery, handling fee included. */
  codTotal: number;
  upiApp: UpiApp;
  onUpiApp: (a: UpiApp) => void;
  className?: string;
}

/** Acceptance marks for the UPI apps the shop actually takes — see PayMarks.tsx. */
const upiApps: { id: UpiApp; label: string; note?: string; mark?: PayMarkId }[] = [
  { id: 'gpay', label: 'Google Pay', mark: 'googlepay' },
  { id: 'phonepe', label: 'PhonePe', mark: 'phonepe' },
  { id: 'paytm', label: 'Paytm', mark: 'paytm' },
  { id: 'other', label: 'Any other UPI app', note: 'Pay by UPI ID or QR' },
];

const Tick = ({ on }: { on: boolean }) => (
  <span
    className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors', on ? 'border-brand bg-brand text-white' : 'border-line-hover bg-surface')}
    aria-hidden
  >
    {on && <Check size={14} strokeWidth={3} />}
  </span>
);

/**
 * Price rail down the left of each choice. This is the reference's strongest
 * idea: what each option costs is visible *before* you pick it, rather than the
 * COD fee appearing in the total afterwards.
 */
const PriceRail = ({ pay, was }: { pay: number; was?: number }) => {
  const saves = was !== undefined && was > pay;
  return (
    <span className="w-[84px] shrink-0 border-r border-line pr-3 text-center sm:w-[98px]">
      {saves && <span className="price-strike tabular block text-caption-2 text-muted">{formatINR(was)}</span>}
      <span className="tabular block font-display text-body-4 font-bold leading-tight text-ink">{formatINR(pay)}</span>
      {saves && <span className="mt-1 inline-block rounded-pill bg-success-bg px-2 py-0.5 text-caption-1 font-bold text-success-text">Save {formatINR(was! - pay)}</span>}
    </span>
  );
};

export const PaymentMethodList = ({ value, onChange, codAvailable = true, prepaidTotal, codTotal, upiApp, onUpiApp, className }: PaymentMethodListProps) => {
  const { t } = useTranslation();
  const online = value !== 'cod';
  const onlineMethods: { id: PaymentMethod; label: string; sub: string; icon: ReactNode }[] = [
    { id: 'upi', label: t('checkout.upi'), sub: t('checkout.upiSub'), icon: <Smartphone size={18} /> },
    { id: 'card', label: t('checkout.card'), sub: t('checkout.cardSub'), icon: <CreditCard size={18} /> },
    { id: 'netbanking', label: t('checkout.netbanking'), sub: t('checkout.netbankingSub'), icon: <Landmark size={18} /> },
  ];

  return (
    <div className={cn('space-y-3', className)} role="radiogroup" aria-label={t('checkout.payWith')}>
      {/* ---- Pay online ---- */}
      <div className={cn('overflow-hidden rounded-section bg-surface transition-shadow', online ? 'shadow-clay-md ring-2 ring-brand' : 'shadow-clay-sm')}>
        <button type="button" role="radio" aria-checked={online} onClick={() => onChange('upi')} className="flex w-full items-center gap-3 p-4 text-left">
          <PriceRail pay={prepaidTotal} was={codAvailable ? codTotal : undefined} />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-body-3 font-bold text-heading">Pay online</span>
            <span className="block text-caption-2 text-muted">UPI, card or net banking · {Math.round(site.cashbackRate * 100)}% wallet cashback</span>
          </span>
          <Tick on={online} />
        </button>

        {online && (
          <div className="border-t border-line">
            {onlineMethods.map((m) => {
              const picked = value === m.id;
              return (
                <div key={m.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    aria-expanded={m.id === 'upi' ? picked : undefined}
                    onClick={() => onChange(m.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-cream-2"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-deep" aria-hidden>
                      {m.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-1 font-med text-ink">{m.label}</span>
                      <span className="block truncate text-caption-1 text-muted">{m.sub}</span>
                    </span>
                    {m.id === 'upi' && !picked && (
                      <span className="hidden shrink-0 items-center gap-1.5 sm:flex" aria-hidden>
                        <PayMark id="googlepay" size={20} />
                        <PayMark id="phonepe" size={20} />
                        <PayMark id="paytm" size={20} />
                      </span>
                    )}
                    {m.id === 'card' && (
                      <span className="hidden shrink-0 items-center gap-1.5 sm:flex" aria-hidden>
                        <PayMark id="visa" size={22} />
                        <PayMark id="mastercard" size={22} />
                      </span>
                    )}
                    {m.id === 'upi' ? (
                      <ChevronDown size={18} className={cn('shrink-0 text-muted transition-transform', picked && 'rotate-180')} aria-hidden />
                    ) : (
                      <Tick on={picked} />
                    )}
                  </button>

                  {m.id === 'upi' && picked && (
                    <ul className="bg-cream-2 pb-1" role="radiogroup" aria-label="Choose a UPI app">
                      {upiApps.map((a) => (
                        <li key={a.id}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={upiApp === a.id}
                            onClick={() => onUpiApp(a.id)}
                            className="flex w-full items-center gap-3 py-2.5 pl-16 pr-4 text-left transition-colors hover:bg-cream-3"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-card bg-surface shadow-clay-sm" aria-hidden>
                              {a.mark ? <PayMark id={a.mark} size={18} /> : <QrCode size={16} className="text-muted" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-body-1 text-ink">{a.label}</span>
                              {a.note && <span className="block text-caption-1 text-muted">{a.note}</span>}
                            </span>
                            <Tick on={upiApp === a.id} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Cash on delivery. Stays visible when unavailable, with the reason (design system law 7). ---- */}
      <div className={cn('overflow-hidden rounded-section transition-shadow', !codAvailable ? 'bg-surface-1' : value === 'cod' ? 'bg-surface shadow-clay-md ring-2 ring-brand' : 'bg-surface shadow-clay-sm')}>
        <button
          type="button"
          role="radio"
          aria-checked={value === 'cod'}
          disabled={!codAvailable}
          onClick={() => onChange('cod')}
          className="flex w-full items-center gap-3 p-4 text-left disabled:cursor-not-allowed"
        >
          <PriceRail pay={codTotal} />
          <span className="min-w-0 flex-1">
            <span className={cn('block font-display text-body-3 font-bold', codAvailable ? 'text-heading' : 'text-muted')}>{t('checkout.cod')}</span>
            <span className="block text-caption-2 text-muted">
              {codAvailable ? `${t('checkout.codSub')} · ${formatINR(site.codFee)} handling fee` : 'Not supported for this pincode — pay online to place this order'}
            </span>
          </span>
          {codAvailable ? <Tick on={value === 'cod'} /> : <Ban size={20} className="shrink-0 text-subtle" aria-hidden />}
        </button>
      </div>
    </div>
  );
};
