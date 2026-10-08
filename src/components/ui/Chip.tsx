import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** shown as a second, muted line (e.g. "₹112 / 100 g") */
  meta?: string;
  /** keep visible, explain why it cannot be chosen (never hide options) */
  unavailable?: string;
  swatch?: string;
  icon?: ReactNode;
  /** show a clear "×" — used for active filters */
  removable?: boolean;
  shape?: 'pill' | 'tile';
}

/** Pill chip — the reference's filter/variant chip: 1px border, radius 128, selected = ink border + brand tint. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected, meta, unavailable, swatch, icon, removable, shape = 'pill', className, children, type, disabled, ...rest },
  ref,
) {
  const isDisabled = disabled || !!unavailable;
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-pressed={selected}
      aria-disabled={isDisabled || undefined}
      disabled={disabled}
      title={unavailable}
      className={cn(
        'inline-flex select-none items-center gap-2 border bg-surface text-left text-caption-2 font-med text-ink transition-colors',
        shape === 'pill' ? 'h-10 rounded-pill px-4' : 'min-h-[52px] flex-col items-start justify-center gap-0 rounded-card px-3 py-2',
        selected ? 'border-ink bg-brand-100 ring-1 ring-ink' : 'border-line hover:border-line-hover hover:bg-surface-1',
        isDisabled && 'cursor-not-allowed border-dashed text-subtle hover:bg-surface',
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center gap-2">
        {swatch && <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: swatch }} aria-hidden />}
        {icon}
        <span className={cn(isDisabled && 'line-through decoration-1')}>{children}</span>
        {removable && <X size={14} aria-hidden />}
      </span>
      {(meta || unavailable) && <span className="text-caption-1 font-reg text-muted">{unavailable ?? meta}</span>}
    </button>
  );
});
