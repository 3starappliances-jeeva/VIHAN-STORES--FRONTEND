import { Star } from 'lucide-react';
import { cn, compactCount } from '@/lib/utils';

export interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  /** show only the number + one star (compact) */
  compact?: boolean;
  className?: string;
}

const px = { sm: 12, md: 16, lg: 20 };

export const Rating = ({ value, count, size = 'sm', compact, className }: RatingProps) => {
  const label = `${value.toFixed(1)} out of 5${count ? `, ${count} reviews` : ''}`;
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-caption-2 text-ink', className)} aria-label={label} title={label}>
        <Star size={px[size]} className="fill-star text-star" aria-hidden />
        <span className="font-med">{value.toFixed(1)}</span>
        {typeof count === 'number' && <span className="text-muted">({compactCount(count)})</span>}
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={label} title={label}>
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative" style={{ width: px[size], height: px[size] }}>
              <Star size={px[size]} className="absolute inset-0 text-surface-2" fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={px[size]} className="text-star" fill="currentColor" />
              </span>
            </span>
          );
        })}
      </span>
      <span className={cn('font-med text-ink', size === 'sm' ? 'text-caption-2' : 'text-body-1')}>{value.toFixed(1)}</span>
      {typeof count === 'number' && <span className={cn('text-muted', size === 'sm' ? 'text-caption-2' : 'text-body-1')}>({compactCount(count)})</span>}
    </span>
  );
};
