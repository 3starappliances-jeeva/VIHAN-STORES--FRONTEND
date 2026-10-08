import { forwardRef, type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'whatsapp' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** stretch to the container width */
  full?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  /** render as an internal link */
  to?: string;
  /** render as an external link */
  href?: string;
  target?: string;
  rel?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-deep shadow-[inset_0_-1px_0_rgba(0,0,0,.08)]',
  /* Buy now. Amber from the Nendran pack — a different hue from the wine primary,
     so the two reading as one action is impossible. ink-on-amber is 8.6:1. */
  accent: 'bg-lemon text-ink hover:bg-[#efb944] active:bg-[#e0a92f] shadow-[inset_0_-1px_0_rgba(0,0,0,.08)]',
  secondary: 'bg-brand-100 text-brand-deep hover:bg-[#dff5ea] active:bg-brand-200',
  outline: 'border border-ink text-ink bg-transparent hover:bg-surface-1 active:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-1 active:bg-surface-2',
  danger: 'bg-danger text-white hover:bg-[#9a2f2f] active:bg-[#7f2626]',
  whatsapp: 'bg-[#128c7e] text-white hover:bg-[#0f7a6e] active:bg-[#0c6559]',
  link: 'text-brand hover:text-brand-hover underline-offset-4 hover:underline h-auto px-0',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-caption-2 gap-1.5 rounded-btn',
  md: 'h-12 px-5 text-body-1 gap-2 rounded-btn',
  lg: 'h-14 px-6 text-body-1 gap-2 rounded-btn',
};

/**
 * Button — the reference's "small" button is 40px / radius 6 / 16px side padding.
 * Loading keeps the width and announces busy state; disabled uses the disabled text token.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, full, icon, iconRight, className, children, to, href, target, rel, disabled, type, ...rest },
  ref,
) {
  const cls = cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-med transition-colors duration-150 ease-standard',
    'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-disabled disabled:shadow-none',
    variants[variant],
    variant !== 'link' && sizes[size],
    full && 'w-full',
    loading && 'relative text-transparent',
    className,
  );
  const inner = (
    <>
      {icon && <span className={cn('shrink-0', loading && 'invisible')} aria-hidden>{icon}</span>}
      <span className={cn(loading && 'invisible')}>{children}</span>
      {iconRight && <span className={cn('shrink-0', loading && 'invisible')} aria-hidden>{iconRight}</span>}
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner className={variant === 'primary' || variant === 'danger' || variant === 'whatsapp' ? 'text-white' : variant === 'accent' ? 'text-ink' : 'text-brand'} />
        </span>
      )}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} onClick={rest.onClick as unknown as MouseEventHandler<HTMLAnchorElement>} aria-disabled={disabled || undefined}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} target={target} rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref} type={type ?? 'button'} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {inner}
    </button>
  );
});
