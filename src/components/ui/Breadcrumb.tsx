import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  to?: string;
}

export const Breadcrumb = ({ items, className }: { items: Crumb[]; className?: string }) => (
  <nav aria-label="Breadcrumb" className={cn('hide-scrollbar overflow-x-auto', className)}>
    <ol className="flex items-center gap-1 whitespace-nowrap text-caption-2 text-muted">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={`${c.label}-${i}`}>
            {i > 0 && <ChevronRight size={14} className="shrink-0 text-subtle" aria-hidden />}
            <li aria-current={last ? 'page' : undefined} className={cn(last && 'font-med text-ink')}>
              {c.to && !last ? (
                <Link to={c.to} className="text-muted hover:text-ink hover:underline">
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  </nav>
);
