import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore, type Toast } from '@/store/ui.store';

const icons = {
  success: <CheckCircle2 size={20} className="text-success" aria-hidden />,
  info: <Info size={20} className="text-info" aria-hidden />,
  warning: <AlertTriangle size={20} className="text-warning" aria-hidden />,
  danger: <XCircle size={20} className="text-danger" aria-hidden />,
};

const ToastItem = ({ toast }: { toast: Toast }) => {
  const dismiss = useUiStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), toast.duration ?? 4500);
    return () => clearTimeout(t);
  }, [toast, dismiss]);
  return (
    <div
      role={toast.tone === 'danger' ? 'alert' : 'status'}
      className={cn('pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-card border bg-surface p-3 pr-2 shadow-2', {
        'border-success-line': toast.tone === 'success',
        'border-info-line': toast.tone === 'info',
        'border-warning-line': toast.tone === 'warning',
        'border-danger-line': toast.tone === 'danger',
      })}
    >
      <span className="mt-0.5 shrink-0">{icons[toast.tone]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-body-1 font-med text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-caption-2 text-muted">{toast.description}</p>}
        {toast.action && (
          <button
            type="button"
            className="mt-1.5 text-caption-2 font-med text-brand underline-offset-2 hover:underline"
            onClick={() => {
              toast.action?.onClick();
              dismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button type="button" aria-label="Dismiss" onClick={() => dismiss(toast.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-btn text-muted hover:bg-surface-1 hover:text-ink">
        <X size={16} aria-hidden />
      </button>
    </div>
  );
};

/** Renders the toast stack: bottom-centre on phones (above the bottom nav), bottom-right on desktop. */
export const Toaster = () => {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--vc-bottom-nav-total)+12px)] z-[1100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
};
