import { cn } from '@/lib/utils';

export const Spinner = ({ className, size = 18, label = 'Loading' }: { className?: string; size?: number; label?: string }) => (
  <svg className={cn('animate-spin', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" role="status" aria-label={label}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
