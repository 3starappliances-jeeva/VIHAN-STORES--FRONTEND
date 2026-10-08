import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface SectionTitleProps {
  overline?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** "View all" link target */
  href?: string;
  linkLabel?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  size?: 'md' | 'lg';
}

export const SectionTitle = ({ overline, title, subtitle, href, linkLabel, align = 'left', as: Tag = 'h2', className, size = 'md' }: SectionTitleProps) => {
  const { t } = useTranslation();
  return (
    <div className={cn('mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center', className)}>
      <div className={cn(align === 'center' && 'max-w-2xl')}>
        {overline && <p className="overline mb-2 text-brand">{overline}</p>}
        <Tag className={cn('font-bold text-heading', size === 'lg' ? 'text-title-4 md:text-title-5' : 'text-title-3 md:text-title-4')}>{title}</Tag>
        {subtitle && <p className="mt-2 text-body-1 text-muted md:text-body-2">{subtitle}</p>}
      </div>
      {href && (
        <Link to={href} className="inline-flex shrink-0 items-center gap-1 text-body-1 font-med text-brand underline-offset-4 hover:underline">
          {linkLabel ?? t('home.viewAll')} <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
};
