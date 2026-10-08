import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** when true, decrementing at min triggers onRemove (trash icon) */
  onRemove?: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const QuantityStepper = ({ value, onChange, min = 1, max = 10, size = 'md', onRemove, label = 'Quantity', className, disabled }: QuantityStepperProps) => {
  const atMin = value <= min;
  const atMax = value >= max;
  const btn = cn('grid place-items-center text-ink transition-colors hover:bg-surface-1 disabled:cursor-not-allowed disabled:text-disabled', size === 'sm' ? 'h-9 w-9' : 'h-11 w-11');
  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center overflow-hidden rounded-btn border border-line bg-surface', disabled && 'opacity-60', className)}>
      <button type="button" className={btn} aria-label={atMin && onRemove ? 'Remove' : 'Decrease quantity'} disabled={disabled || (atMin && !onRemove)} onClick={() => (atMin && onRemove ? onRemove() : onChange(value - 1))}>
        {atMin && onRemove ? <Trash2 size={16} aria-hidden /> : <Minus size={16} aria-hidden />}
      </button>
      <output className={cn('tabular min-w-[2.25rem] text-center font-med', size === 'sm' ? 'text-caption-2' : 'text-body-1')} aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} aria-label="Increase quantity" disabled={disabled || atMax} title={atMax ? `Maximum ${max} per order` : undefined} onClick={() => onChange(value + 1)}>
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
};
