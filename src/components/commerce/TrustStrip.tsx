import { Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { site } from '@/config/site';
import { formatINR } from '@/lib/utils';
import { ClayIcon, ProgressBar } from '@/components/ui';
import type { ClayGlyph, ClayTone } from '@/types';

const items: { glyph: ClayGlyph; tone: ClayTone; titleKey: string; subKey: string }[] = [
  { glyph: 'truck', tone: 'sky', titleKey: 'trust.shipping', subKey: 'trust.shippingSub' },
  { glyph: 'wallet', tone: 'mint', titleKey: 'trust.cod', subKey: 'trust.codSub' },
  { glyph: 'packageCheck', tone: 'butter', titleKey: 'trust.batch', subKey: 'trust.batchSub' },
  { glyph: 'message', tone: 'blush', titleKey: 'trust.whatsapp', subKey: 'trust.whatsappSub' },
];

/**
 * The four promises, as moulded clay badges.
 *
 * Layout note: the icon used to sit *beside* the copy. In a two-column grid on a
 * phone that left the text roughly 80px wide, so "Free shipping above ₹499"
 * wrapped to one word per line. Stacking the icon above the copy gives the text
 * the full width of the card, which is what actually fixes the wrapping — the
 * centred layout is a consequence of that, not decoration.
 *
 * `compact` keeps the original side-by-side row for the shop sidebar, where the
 * strip is a single full-width column and the horizontal form reads better.
 */
export const TrustStrip = ({ className, compact }: { className?: string; compact?: boolean }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <ul className={cn('grid gap-2.5', className)} aria-label="Why shop with us">
        {items.map(({ glyph, tone, titleKey }) => (
          <li key={titleKey} className="flex items-center gap-3 rounded-tile bg-surface p-2.5 shadow-clay-sm">
            <ClayIcon glyph={glyph} tone={tone} size="sm" />
            <span className="min-w-0 text-caption-2 font-med text-ink">{t(titleKey)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)} aria-label="Why shop with us">
      {items.map(({ glyph, tone, titleKey, subKey }) => (
        <li
          key={titleKey}
          className="group flex flex-col items-center gap-2.5 rounded-section bg-surface p-3 text-center shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-md sm:gap-3 sm:p-5"
        >
          <ClayIcon glyph={glyph} tone={tone} size="md" className="transition-transform duration-300 ease-bouncy group-hover:scale-110 group-hover:-rotate-6" />
          <span>
            <span className="block font-display text-caption-2 font-bold leading-tight text-ink sm:text-body-1">{t(titleKey)}</span>
            <span className="mt-1 block text-caption-1 leading-snug text-muted">{t(subKey)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

/** "Add ₹120 more for free shipping" — progress toward the threshold. */
export const FreeShippingMeter = ({ gap, className }: { gap: number; className?: string }) => {
  const { t } = useTranslation();
  const unlocked = gap <= 0;
  const progress = site.freeShippingThreshold - gap;
  return (
    <div className={cn('rounded-card px-3.5 py-3', unlocked ? 'bg-success-bg text-success-text' : 'bg-cream text-ink', className)}>
      <p className="flex items-center gap-2 text-caption-2 font-med">
        <Truck size={16} aria-hidden />
        {unlocked ? t('cart.freeShippingUnlocked') : t('cart.freeShippingGap', { amount: formatINR(gap) })}
      </p>
      <ProgressBar value={progress} max={site.freeShippingThreshold} label="Progress to free shipping" tone={unlocked ? 'success' : 'brand'} className="mt-2" />
    </div>
  );
};
