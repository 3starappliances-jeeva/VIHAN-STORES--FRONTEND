import type { ReactNode } from 'react';
import { Check, ChefHat, ClipboardCheck, Package, PackageCheck, Truck, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const flow: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'packed', 'shipped', 'delivered'];
const icons: Record<OrderStatus, ReactNode> = {
  placed: <ClipboardCheck size={16} />,
  confirmed: <Check size={16} />,
  preparing: <ChefHat size={16} />,
  packed: <Package size={16} />,
  shipped: <Truck size={16} />,
  delivered: <PackageCheck size={16} />,
  cancelled: <XCircle size={16} />,
};

/** Vertical timeline on phones, horizontal on desktop. Current step pulses; cancelled ends the flow. */
export const OrderTimeline = ({ order, className }: { order: Order; className?: string }) => {
  const { t } = useTranslation();
  const cancelled = order.status === 'cancelled';
  const currentIndex = cancelled ? -1 : flow.indexOf(order.status);
  const at = (s: OrderStatus) => order.statusHistory.find((h) => h.status === s)?.at;
  const steps = cancelled ? [...flow.slice(0, order.statusHistory.length - 1), 'cancelled' as OrderStatus] : flow;

  return (
    <ol className={cn('relative flex flex-col gap-0 md:flex-row md:justify-between', className)} aria-label="Order progress">
      {steps.map((s, i) => {
        const done = cancelled ? s !== 'cancelled' : i < currentIndex;
        const current = cancelled ? s === 'cancelled' : i === currentIndex;
        const time = at(s);
        return (
          <li key={s} className="relative flex flex-1 gap-3 pb-6 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center" aria-current={current ? 'step' : undefined}>
            {/* connector */}
            {i < steps.length - 1 && (
              <span className={cn('absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-0.5 md:left-[calc(50%+16px)] md:top-[15px] md:h-0.5 md:w-[calc(100%-32px)]', done ? 'bg-brand' : 'bg-surface-2')} aria-hidden />
            )}
            <span
              className={cn(
                'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2',
                done && 'border-brand bg-brand text-white',
                current && !cancelled && 'border-brand bg-brand-100 text-brand-deep ring-4 ring-brand-100',
                current && cancelled && 'border-danger bg-danger-bg text-danger',
                !done && !current && 'border-surface-2 bg-surface text-subtle',
              )}
              aria-hidden
            >
              {done ? <Check size={16} /> : icons[s]}
            </span>
            <span className="min-w-0">
              <span className={cn('block text-body-1 font-med', done || current ? 'text-ink' : 'text-subtle')}>{t(`status.${s}`)}</span>
              <span className="block text-caption-1 text-muted">{time ? formatDate(time, true) : current ? 'In progress' : '—'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};
