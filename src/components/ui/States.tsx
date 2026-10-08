import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, PackageOpen, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export const EmptyState = ({ icon, title, description, action, className, compact }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center text-center', compact ? 'py-8' : 'py-16', className)}>
    <div className="grid h-16 w-16 place-items-center rounded-full bg-cream text-brand" aria-hidden>
      {icon ?? <PackageOpen size={28} />}
    </div>
    <h2 className="mt-4 text-title-2 font-med text-heading">{title}</h2>
    {description && <p className="mt-2 max-w-md text-body-1 text-muted">{description}</p>}
    {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
  </div>
);

export const NoResults = ({ term, onClear }: { term?: string; onClear?: () => void }) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<SearchX size={28} />}
      title={term ? `No results for “${term}”` : 'Nothing matches these filters'}
      description="Try a simpler word — “ragi”, “ghee”, “honey” — or clear the filters and browse a shelf."
      action={
        <>
          {onClear && (
            <Button variant="outline" onClick={onClear}>
              {t('common.clearAll')}
            </Button>
          )}
          <Button to="/shop">{t('nav.shopAll')}</Button>
        </>
      }
    />
  );
};

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export const ErrorState = ({ title, description, onRetry, className, compact }: ErrorStateProps) => {
  const { t } = useTranslation();
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-card border border-danger-line bg-danger-bg text-center', compact ? 'p-6' : 'p-10', className)}>
      <AlertTriangle size={28} className="text-danger" aria-hidden />
      <h2 className="mt-3 text-title-1 font-med text-heading">{title ?? t('common.somethingWrong')}</h2>
      {description && <p className="mt-1 max-w-md text-body-1 text-muted">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
};
