import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * The Vihaan roundel.
 *
 * The artwork carries its own wordmark, so it is shown on its own rather than
 * beside typed-out text that would repeat the name. It is sized large enough
 * (44px on phones, 56px from lg) that "VIHAAN NATURAL CARE" inside the ring
 * stays legible.
 *
 * Sizing is done with classes, not inline styles, so a caller can change it per
 * breakpoint. The file is a circular PNG with transparent corners, so it sits
 * cleanly on the header tint, the cream footer, or any other surface.
 */
export const LogoMark = ({ className }: { className?: string }) => (
  <img
    src="/images/logo.png"
    alt=""
    width={112}
    height={112}
    className={cn('shrink-0 rounded-full object-contain', className)}
    decoding="async"
  />
);

/**
 * Brand link. The name lives in `aria-label` and a visually-hidden span, so
 * screen readers, search engines and translation still get real text even
 * though the visible mark is a bitmap.
 */
export const Logo = ({ className, compact }: { className?: string; compact?: boolean }) => {
  const { t } = useTranslation();
  const name = `${t('brand.name')} ${t('brand.sub')}`;
  return (
    <Link to="/" className={cn('inline-flex items-center no-underline', className)} aria-label={`${name} — home`}>
      <LogoMark className={compact ? 'h-10 w-10' : 'h-11 w-11 lg:h-14 lg:w-14'} />
      <span className="sr-only">{name}</span>
    </Link>
  );
};
