import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn, formatINR } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useCartStore, type ResolvedLine } from '@/store/cart.store';
import { toast } from '@/store/ui.store';
import { Button, ClayThumb, QuantityStepper } from '@/components/ui';

export interface CartLineItemProps {
  line: ResolvedLine;
  compact?: boolean;
  className?: string;
}

/** One cart row: thumbnail, name + variant, stepper, line total, save-for-later / remove with undo. */
export const CartLineItem = ({ line, compact, className }: CartLineItemProps) => {
  const { t } = useTranslation();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const add = useCartStore((s) => s.add);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const { product, sku, qty, lineId } = line;
  const lowStock = sku.stock > 0 && sku.stock < qty + 3;

  const onRemove = () => {
    remove(lineId);
    track('remove_from_cart', { item_id: sku.id, quantity: qty });
    toast({ tone: 'info', title: `${product.shortName} removed`, action: { label: t('cart.undo'), onClick: () => add(product.id, sku.id, qty) } });
  };

  return (
    <div className={cn('flex gap-3 py-4', className)}>
      <Link to={`/product/${product.slug}`} className="media block h-20 w-20 shrink-0 overflow-hidden rounded-card sm:h-24 sm:w-24" tabIndex={-1} aria-hidden>
        <ClayThumb image={product.image} glyph={product.glyph} tone={product.tone} className="h-full w-full rounded-none" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${product.slug}`} className="block truncate text-body-1 font-med text-ink no-underline hover:underline">
              {product.name}
            </Link>
            <p className="mt-0.5 text-caption-2 text-muted">{line.variantLabel}</p>
            {lowStock && <p className="mt-1 text-caption-1 font-med text-warning">Only {sku.stock} left</p>}
          </div>
          <div className="text-right">
            <p className="tabular text-body-1 font-med text-ink">{formatINR(sku.price * qty)}</p>
            {sku.mrp > sku.price && <p className="tabular price-strike text-caption-2 text-muted">{formatINR(sku.mrp * qty)}</p>}
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          {line.savedForLater ? (
            <Button size="sm" variant="secondary" onClick={() => saveForLater(lineId, false)}>
              {t('cart.moveToCart')}
            </Button>
          ) : (
            <QuantityStepper size="sm" value={qty} max={Math.min(10, sku.stock)} onChange={(n) => setQty(lineId, n)} onRemove={onRemove} label={`Quantity for ${product.name}`} />
          )}
          <div className="flex gap-1">
            {!compact && !line.savedForLater && (
              <Button size="sm" variant="ghost" className="h-9 px-2 text-caption-2 text-muted" onClick={() => saveForLater(lineId, true)}>
                {t('cart.saveForLater')}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-9 px-2 text-caption-2 text-muted" onClick={onRemove}>
              {t('cart.remove')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
