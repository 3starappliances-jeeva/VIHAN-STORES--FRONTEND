import { cn } from '@/lib/utils';

export const Skeleton = ({ className }: { className?: string }) => <div className={cn('skeleton', className)} aria-hidden />;

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden" aria-hidden>
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="space-y-2 p-3 sm:p-3.5">
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="mt-1 h-10 w-full" />
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="page py-8" role="status" aria-label="Loading page">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="mt-3 h-4 w-1/2" />
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
