import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap, useScrollLock } from '@/hooks';
import { IconButton } from './IconButton';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** bottom sheet on small screens */
  sheet?: boolean;
}

export const Modal = ({ open, onClose, title, description, children, footer, size = 'md', sheet = true }: ModalProps) => {
  useScrollLock(open);
  const ref = useFocusTrap(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center" role="presentation">
      {/* bg-ink/40 can't compile — `ink` is a plain var() token, so Tailwind can't apply an opacity modifier to it */}
      <div className="absolute inset-0 bg-[#212121]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-desc' : undefined}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col bg-surface shadow-3',
          sheet ? 'animate-slide-in-up rounded-t-section sm:animate-fade-up sm:rounded-section' : 'animate-fade-up rounded-section',
          size === 'sm' ? 'sm:max-w-md' : size === 'md' ? 'sm:max-w-lg' : 'sm:max-w-3xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div>
            {title && <h2 id="modal-title" className="text-title-2 font-med">{title}</h2>}
            {description && <p id="modal-desc" className="mt-1 text-body-1 text-muted">{description}</p>}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-2">
            <X size={20} aria-hidden />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
