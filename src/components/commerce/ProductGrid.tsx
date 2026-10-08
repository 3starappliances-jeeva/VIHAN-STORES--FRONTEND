import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton, ProductCardSkeleton } from '@/components/ui';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products, loading, className, cols = 4 }: { products: Product[]; loading?: boolean; className?: string; cols?: 3 | 4 }) => (
  <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4', cols === 4 ? 'lg:grid-cols-4 2xl:grid-cols-5' : 'lg:grid-cols-3', className)} aria-busy={loading || undefined}>
    {loading ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
  </div>
);

/** Horizontal, snap-scrolling rail with keyboard-reachable prev/next on desktop. */
export const ProductRail = ({ products, loading, className, label }: { products: Product[]; loading?: boolean; className?: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' });
  return (
    <div className={cn('relative', className)}>
      <div ref={ref} className="snap-rail -mx-4 px-4 pb-2 md:mx-0 md:px-0" role="list" aria-label={label}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[172px] sm:w-[220px] lg:w-[248px]" role="listitem">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p) => (
              <div key={p.id} role="listitem" className="flex">
                <ProductCard product={p} layout="rail" />
              </div>
            ))}
      </div>
      <div className="absolute -top-14 right-0 hidden gap-2 md:flex">
        <IconButton label="Scroll left" variant="outline" size="sm" onClick={() => scroll(-1)}>
          <ChevronLeft size={18} aria-hidden />
        </IconButton>
        <IconButton label="Scroll right" variant="outline" size="sm" onClick={() => scroll(1)}>
          <ChevronRight size={18} aria-hidden />
        </IconButton>
      </div>
    </div>
  );
};
