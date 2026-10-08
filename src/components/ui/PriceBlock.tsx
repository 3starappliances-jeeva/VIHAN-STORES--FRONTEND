import { useTranslation } from 'react-i18next';
import { cn, formatINR, percentOff } from '@/lib/utils';

export interface PriceBlockProps {
  price: number;
  mrp?: number;
  size?: 'sm' | 'md' | 'lg';
  /** show "Incl. of all taxes" */
  taxes?: boolean;
  unit?: string;
  className?: string;
  align?: 'left' | 'right';
}

/** Price with MRP struck and a computed "% off" — the discount is never hand-typed. */
export const PriceBlock = ({ price, mrp, size = 'md', taxes, unit, className, align = 'left' }: PriceBlockProps) => {
  const { t } = useTranslation();
  const off = mrp ? percentOff(price, mrp) : 0;
  const priceCls = size === 'sm' ? 'text-body-1' : size === 'md' ? 'text-title-1' : 'text-title-3';
  return (
    <div className={cn('flex flex-col', align === 'right' && 'items-end', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={cn('tabular font-med text-ink', priceCls)}>
          <span className="sr-only">Price </span>
          {formatINR(price)}
        </span>
        {mrp && mrp > price && (
          <>
            <span className={cn('tabular price-strike text-muted', size === 'sm' ? 'text-caption-2' : 'text-body-1')}>
              <span className="sr-only">MRP </span>
              {formatINR(mrp)}
            </span>
            {off > 0 && <span className={cn('font-med text-success-text', size === 'sm' ? 'text-caption-2' : 'text-body-1')}>{t('product.off', { pct: off })}</span>}
          </>
        )}
        {unit && <span className="text-caption-2 text-muted">{unit}</span>}
      </div>
      {taxes && <span className="text-caption-1 text-subtle">{t('product.inclTaxes')}</span>}
    </div>
  );
};
