import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap, useScrollLock } from '@/hooks';
import { IconButton } from './IconButton';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  side?: 'left' | 'right';
  children?: ReactNode;
  footer?: ReactNode;
  width?: string;
  /** id for aria-labelledby */
  id?: string;
}

export const Drawer = ({ open, onClose, title, side = 'right', children, footer, width = 'max-w-md', id = 'drawer' }: DrawerProps) => {
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
    <div className="fixed inset-0 z-[1000]" role="presentation">
      {/* bg-ink/40 can't compile — `ink` is a plain var() token, so Tailwind can't apply an opacity modifier to it */}
      <div className="absolute inset-0 bg-[#212121]/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        className={cn(
          'absolute inset-y-0 flex w-full flex-col bg-surface shadow-3',
          width,
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          {title && <h2 id={`${id}-title`} className="text-title-1 font-med">{title}</h2>}
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <X size={20} aria-hidden />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-4 shadow-sheet">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
