import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, percentOff } from '@/lib/utils';
import { useAddToCart } from '@/hooks/useAddToCart';
import { categories } from '@/data/catalogue';
import { Badge, Button, ClayMedia, PriceBlock, Rating } from '@/components/ui';
import type { Product } from '@/types';

export interface ProductCardProps {
  product: Product;
  /** rail cards have a fixed width so they snap-scroll on phones */
  layout?: 'grid' | 'rail';
  className?: string;
  priority?: boolean;
}

/**
 * Product card — reference anatomy: media on cream, badge top-left, name, benefit line,
 * rating, price with MRP struck, and an "Add" (or "Options" when the product has choices).
 */
export const ProductCard = memo(function ProductCard({ product, layout = 'grid', className, priority }: ProductCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const sku = product.skus.find((s) => s.id === product.defaultSku) ?? product.skus[0];
  const hasChoices = product.steps.length > 1 || (product.steps[0]?.options.length ?? 0) > 1;
  const off = percentOff(sku.price, sku.mrp);
  const soldOut = product.skus.every((s) => s.stock <= 0);
  const href = `/product/${product.slug}`;
  const categoryName = categories.find((c) => c.slug === product.category)?.name;
  const badge = product.isKit ? { tone: 'lemon' as const, label: product.audience } : product.isNew ? { tone: 'brand' as const, label: 'New' } : product.tags.includes('bestseller') ? { tone: 'ink' as const, label: 'Bestseller' } : off >= 10 ? { tone: 'success' as const, label: t('product.off', { pct: off }) } : null;

  const onPrimary = () => {
    if (hasChoices) navigate(href);
    else addToCart(product, sku.id, 1);
  };

  return (
    <article
      className={cn(
        'card group relative flex flex-col overflow-hidden transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-2',
        layout === 'rail' && 'w-[168px] shrink-0 sm:w-[220px] lg:w-[248px]',
        className,
      )}
      data-testid="product-card"
    >
      <Link to={href} className="media media-contain relative block aspect-square overflow-hidden bg-white no-underline" tabIndex={-1} aria-hidden>
        {product.image ? (
          <img
            src={product.image}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full p-3 transition-transform duration-500 ease-standard group-hover:scale-[1.06] sm:p-4"
            width={480}
            height={480}
          />
        ) : (
          <span className="block h-full w-full transition-transform duration-500 ease-standard group-hover:scale-[1.06]">
            <ClayMedia glyph={product.glyph} tone={product.tone} />
          </span>
        )}
        {badge && (
          <Badge tone={badge.tone} className="absolute left-2 top-2 shadow-1">
            {badge.label}
          </Badge>
        )}
        {soldOut && <span className="absolute inset-x-0 bottom-0 bg-[#212121]/70 py-1.5 text-center text-caption-2 font-med text-white">{t('product.outOfStock')}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-3.5">
        {categoryName && <p className="overline truncate text-brand">{categoryName}</p>}
        <h3 className="text-body-1 font-med leading-snug text-heading">
          <Link to={href} className="line-clamp-2 text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <PriceBlock price={sku.price} mrp={sku.mrp} size="sm" />
          <Rating value={product.rating} count={product.reviewCount} compact />
        </div>
        <Button
          size="sm"
          full
          variant={hasChoices ? 'outline' : 'primary'}
          onClick={onPrimary}
          disabled={soldOut}
          className="relative z-10 mt-2.5 uppercase tracking-wide"
          icon={!hasChoices && <Plus size={16} />}
          aria-label={`${hasChoices ? t('product.options', { count: product.skus.length }) : t('product.add')}: ${product.name}`}
        >
          {hasChoices ? t('product.options', { count: product.skus.length }) : t('product.add')}
        </Button>
      </div>
    </article>
  );
});
