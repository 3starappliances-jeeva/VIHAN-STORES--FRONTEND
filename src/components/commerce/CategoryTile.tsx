import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ClayMedia } from '@/components/ui';
import type { Category } from '@/types';

/**
 * Category tile. Shows real photography when a category has it and a moulded
 * clay glyph when it doesn't, so a mixed grid still reads as one set.
 */
export const CategoryTile = ({ category, className, size = 'md' }: { category: Category; className?: string; size?: 'sm' | 'md' }) => (
  <Link
    to={`/shop/${category.slug}`}
    className={cn(
      'group relative flex flex-col overflow-hidden rounded-tile bg-surface p-2.5 no-underline shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-md sm:p-3',
      size === 'sm' ? 'aspect-square' : 'aspect-[4/5]',
      className,
    )}
  >
    <span className="line-clamp-1 px-0.5 text-caption-2 font-med text-ink sm:text-body-1">{category.name}</span>
    <span className="relative mt-1.5 flex-1 overflow-hidden rounded-tile">
      {category.image ? (
        <img src={category.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 ease-standard group-hover:scale-105" />
      ) : (
        <span className="block h-full w-full transition-transform duration-500 ease-standard group-hover:scale-105">
          <ClayMedia glyph={category.glyph} tone={category.tone} />
        </span>
      )}
    </span>
  </Link>
);
