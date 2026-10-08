import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** accessible name — required, icons alone are not labels */
  label: string;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'outline' | 'solid';
  badge?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', variant = 'ghost', badge, className, children, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-btn text-ink transition-colors',
        size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        variant === 'ghost' && 'hover:bg-surface-1 active:bg-surface-2',
        variant === 'outline' && 'border border-line hover:border-line-hover hover:bg-surface-1',
        variant === 'solid' && 'bg-brand text-white hover:bg-brand-hover',
        'disabled:cursor-not-allowed disabled:text-disabled',
        className,
      )}
      {...rest}
    >
      {children}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-brand px-1 text-[11px] font-med leading-none text-white" aria-hidden>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
});
