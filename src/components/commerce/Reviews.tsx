import { useState } from 'react';
import { BadgeCheck, MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate } from '@/lib/utils';
import { Button, Rating, Skeleton } from '@/components/ui';
import type { Product, Review } from '@/types';

export const ReviewCard = ({ review }: { review: Review }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const long = review.body.length > 180;
  return (
    <article className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <Rating value={review.rating} size="sm" />
        <time dateTime={review.date} className="text-caption-1 text-subtle">{formatDate(review.date)}</time>
      </div>
      {review.title && <h3 className="mt-2 text-body-1 font-med text-heading">{review.title}</h3>}
      <p className={cn('mt-1.5 text-body-1 text-muted', !expanded && long && 'line-clamp-2')}>{review.body}</p>
      {long && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 text-caption-2 font-med text-brand underline-offset-2 hover:underline" aria-expanded={expanded}>
          {expanded ? 'Show less' : t('common.readMore')}
        </button>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption-2 text-muted">
        <span className="font-med text-ink">{review.author}</span>
        <span>· {review.city}</span>
        {review.verified && (
          <span className="inline-flex items-center gap-1 text-success-text">
            <BadgeCheck size={14} aria-hidden /> {t('common.verified')}
          </span>
        )}
      </p>
    </article>
  );
};

/** Average, histogram (from the reviews you pass in) and the review list. Never invents numbers. */
export const ReviewSummary = ({ product, reviews, loading, className }: { product: Product; reviews?: Review[]; loading?: boolean; className?: string }) => {
  const { t } = useTranslation();
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: (reviews ?? []).filter((r) => Math.round(r.rating) === star).length }));
  const total = dist.reduce((a, b) => a + b.n, 0);
  return (
    <section className={className} aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="text-title-2 font-med text-heading">{t('product.reviews', { count: product.reviewCount })}</h2>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card p-4">
          <p className="text-title-5 font-med leading-none text-ink">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} size="md" className="mt-2" />
          <p className="mt-1 text-caption-2 text-muted">Based on {product.reviewCount.toLocaleString('en-IN')} verified orders</p>
          <ul className="mt-4 space-y-1.5" aria-label="Rating distribution">
            {dist.map((d) => (
              <li key={d.star} className="flex items-center gap-2 text-caption-2 text-muted">
                <span className="w-3 text-right tabular">{d.star}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2" aria-hidden>
                  <span className="block h-full rounded-pill bg-star" style={{ width: total ? `${(d.n / total) * 100}%` : '0%' }} />
                </span>
                <span className="w-6 tabular">{d.n}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" full className="mt-4" icon={<MessageSquareText size={16} />}>
            Write a review
          </Button>
          <p className="mt-2 text-caption-1 text-subtle">Only customers with a delivered order can review.</p>
        </div>
        <div className="space-y-3">
          {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          {reviews?.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          {!loading && reviews?.length === 0 && <p className="text-body-1 text-muted">No reviews yet — be the first after your order arrives.</p>}
        </div>
      </div>
    </section>
  );
};

const qa = [
  { q: '[Customer question — e.g. “Is this suitable for a 2-year-old?”]', a: '[Store answer, kept short and honest. Answers come from the Vihaan team.]' },
  { q: '[Customer question — e.g. “How long does an opened pack last?”]', a: '[Store answer — e.g. best within 30 days of opening; keep the zip closed.]' },
];

export const QABlock = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <section className={className} aria-labelledby="qa-title">
      <div className="flex items-end justify-between gap-4">
        <h2 id="qa-title" className="text-title-2 font-med text-heading">{t('product.qa')}</h2>
        <Button variant="link" size="sm">Ask a question</Button>
      </div>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {qa.map((item) => (
          <div key={item.q} className="py-4">
            <dt className="text-body-1 font-med text-ink">Q: {item.q}</dt>
            <dd className="mt-1 text-body-1 text-muted">A: {item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
