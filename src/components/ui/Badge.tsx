import type { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'lemon' | 'ink';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-100 text-brand-deep',
  neutral: 'bg-surface-1 text-muted',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-ink',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  lemon: 'bg-lemon text-ink',
  ink: 'bg-ink text-white',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: ReactNode;
}

export const Badge = ({ tone = 'neutral', size = 'sm', dot, icon, className, children, ...rest }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-btn font-med',
      size === 'sm' ? 'h-6 px-2 text-caption-1' : 'h-7 px-2.5 text-caption-2',
      tones[tone],
      className,
    )}
    {...rest}
  >
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'warning' ? 'bg-warning' : 'bg-current')} aria-hidden />}
    {icon}
    {children}
  </span>
);

const statusTone: Record<OrderStatus, BadgeTone> = {
  placed: 'info',
  confirmed: 'info',
  preparing: 'warning',
  packed: 'warning',
  shipped: 'brand',
  delivered: 'success',
  cancelled: 'danger',
};

export const StatusBadge = ({ status, className }: { status: OrderStatus; className?: string }) => {
  const { t } = useTranslation();
  return (
    <Badge tone={statusTone[status]} dot className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
};
