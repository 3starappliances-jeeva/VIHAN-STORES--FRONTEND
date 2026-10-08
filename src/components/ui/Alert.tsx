import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertTone = 'success' | 'info' | 'warning' | 'danger';

const styles: Record<AlertTone, { box: string; icon: ReactNode }> = {
  success: { box: 'border-success-line bg-success-bg text-success-text', icon: <CheckCircle2 size={18} className="text-success" aria-hidden /> },
  info: { box: 'border-info-line bg-info-bg text-ink', icon: <Info size={18} className="text-info" aria-hidden /> },
  warning: { box: 'border-warning-line bg-warning-bg text-ink', icon: <AlertTriangle size={18} className="text-warning" aria-hidden /> },
  danger: { box: 'border-danger-line bg-danger-bg text-danger', icon: <XCircle size={18} className="text-danger" aria-hidden /> },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  live?: boolean;
}

export const Alert = ({ tone = 'info', title, children, action, className, live }: AlertProps) => (
  <div role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined} className={cn('flex items-start gap-3 rounded-card border p-3.5 text-body-1', styles[tone].box, className)}>
    <span className="mt-0.5 shrink-0">{styles[tone].icon}</span>
    <div className="min-w-0 flex-1">
      {title && <p className="font-med">{title}</p>}
      {children && <div className={cn('text-caption-2', title && 'mt-0.5')}>{children}</div>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const ProgressBar = ({ value, max = 100, label, className, tone = 'brand' }: { value: number; max?: number; label: string; className?: string; tone?: 'brand' | 'success' }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-label={label} className={cn('h-1.5 w-full overflow-hidden rounded-pill bg-surface-2', className)}>
      <div className={cn('h-full rounded-pill transition-[width] duration-300', tone === 'brand' ? 'bg-brand' : 'bg-success')} style={{ width: `${pct}%` }} />
    </div>
  );
};
