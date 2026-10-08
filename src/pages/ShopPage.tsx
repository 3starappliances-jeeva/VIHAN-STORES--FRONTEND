import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categories } from '@/data/catalogue';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks';
import type { ProductQuery } from '@/services/api';
import type { CategorySlug } from '@/types';
import { Seo } from '@/components/layout';
import { Breadcrumb, Button, Chip, Drawer, ErrorState, NoResults, Select } from '@/components/ui';
import { ProductGrid, TrustStrip } from '@/components/commerce';

const PAGE = 8;
const tagFilters = [
  { id: 'bestseller', label: 'Bestsellers' },
  { id: 'new', label: 'New' },
  { id: 'no-sugar', label: 'No added sugar' },
  { id: 'kit', label: 'Kits & combos' },
];
const sorts: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest first' },
];

/** Category / search listing. Filters and sort live in the URL so results can be shared and the back button works. */
const ShopPage = () => {
  const { t } = useTranslation();
  const { category } = useParams<{ category?: CategorySlug }>();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pages, setPages] = useState(1);

  const search = params.get('search') ?? '';
  const sort = (params.get('sort') as ProductQuery['sort']) ?? 'popular';
  const tags = params.get('tags')?.split(',').filter(Boolean) ?? [];
  const cat = categories.find((c) => c.slug === category);

  const query = useMemo<ProductQuery>(() => ({ category: category ?? 'all', search: search || undefined, sort, tags, page: 1, pageSize: PAGE * pages }), [category, search, sort, tags.join(','), pages]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = useProducts(query);

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
    setPages(1);
  };
  const toggleTag = (id: string) => update({ tags: (tags.includes(id) ? tags.filter((x) => x !== id) : [...tags, id]).join(',') || undefined });
  const clearAll = () => update({ tags: undefined, search: undefined, sort: undefined });
  const activeCount = tags.length + (search ? 1 : 0);
  const title = search ? `Results for “${search}”` : cat?.name ?? t('nav.shopAll');


  return (
    <div className="page pb-8 pt-4">
      <Seo title={title} description={cat?.blurb} />
      <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.shop'), to: '/shop' }, ...(cat ? [{ label: cat.name }] : [])]} />

      <header className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-title-3 font-med text-heading md:text-title-4">{title}</h1>
          {cat?.blurb && !search && <p className="mt-1 text-body-1 text-muted">{cat.blurb}</p>}
          {q.data && <p className="mt-1 text-caption-2 text-muted" aria-live="polite">{t('common.showing', { shown: q.data.items.length, total: q.data.total })}</p>}
        </div>
        {/* "Filters (2)" + a 12rem select is ~310px — wider than a 320px screen
            once the page gutters are taken off. The select takes whatever is
            left instead of forcing the row to overflow. */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<SlidersHorizontal size={16} />} className="shrink-0 lg:hidden" onClick={() => setFiltersOpen(true)}>
            Filters{activeCount ? ` (${activeCount})` : ''}
          </Button>
          <Select aria-label={t('common.sortBy')} options={sorts} value={sort} onChange={(e) => update({ sort: e.target.value === 'popular' ? undefined : e.target.value })} className="min-w-0 flex-1 sm:w-48 sm:flex-none [&_select]:h-10 [&_select]:text-caption-2" />
        </div>
      </header>

      {/* category rail */}
      <nav className="hide-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Categories">
        {[{ slug: '', name: 'All' }, ...categories].map((c) => {
          const active = (category ?? '') === c.slug;
          return (
            <Link
              key={c.slug || 'all'}
              to={{ pathname: c.slug ? `/shop/${c.slug}` : '/shop', search: params.toString() ? `?${params.toString()}` : '' }}
              onClick={() => setPages(1)}
              aria-current={active ? 'page' : undefined}
              className={cn('inline-flex h-10 shrink-0 items-center rounded-pill border px-4 text-caption-2 font-med text-ink no-underline', active ? 'border-ink bg-brand-100' : 'border-line hover:border-line-hover hover:bg-surface-1')}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[240px_1fr]">
        {/* desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--vc-header-h)+16px)] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-body-1 font-med text-heading">Filters</h2>
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="text-caption-2 font-med text-brand hover:underline">
                  {t('common.clearAll')}
                </button>
              )}
            </div>
            <fieldset>
              <legend className="mb-2.5 text-caption-2 font-med text-muted">Highlights</legend>
              <div className="flex flex-wrap gap-2">
                {tagFilters.map((f) => (
                  <Chip key={f.id} selected={tags.includes(f.id)} onClick={() => toggleTag(f.id)}>
                    {f.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <TrustStrip compact className="grid-cols-1" />
          </div>
        </aside>

        <div>
          {activeCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {search && (
                <Chip removable selected onClick={() => update({ search: undefined })} aria-label={`Remove search ${search}`}>
                  “{search}”
                </Chip>
              )}
              {tags.map((id) => (
                <Chip key={id} removable selected onClick={() => toggleTag(id)} aria-label={`Remove filter ${id}`}>
                  {tagFilters.find((f) => f.id === id)?.label ?? id}
                </Chip>
              ))}
              <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-caption-2 font-med text-muted hover:text-ink">
                <X size={14} aria-hidden /> {t('common.clearAll')}
              </button>
            </div>
          )}

          {q.isError ? (
            <ErrorState description={(q.error as Error).message} onRetry={() => q.refetch()} />
          ) : q.data && q.data.items.length === 0 ? (
            <NoResults term={search} onClear={clearAll} />
          ) : (
            <>
              <ProductGrid products={q.data?.items ?? []} loading={q.isPending} cols={4} />
              {q.data && q.data.items.length < q.data.total && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <p className="text-caption-2 text-muted">{t('common.showing', { shown: q.data.items.length, total: q.data.total })}</p>
                  <Button variant="outline" onClick={() => setPages((p) => p + 1)} loading={q.isFetching}>
                    {t('common.loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filters drawer */}
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" id="filters" width="max-w-sm" footer={<Button full onClick={() => setFiltersOpen(false)}>Show results{q.data ? ` (${q.data.total})` : ''}</Button>}>
        <div className="space-y-6 p-4">
          <fieldset>
            <legend className="mb-2.5 text-caption-2 font-med text-muted">Highlights</legend>
            <div className="flex flex-wrap gap-2">
              {tagFilters.map((f) => (
                <Chip key={f.id} selected={tags.includes(f.id)} onClick={() => toggleTag(f.id)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2.5 text-caption-2 font-med text-muted">{t('common.sortBy')}</legend>
            <div className="flex flex-wrap gap-2">
              {sorts.map((s) => (
                <Chip key={s.value} selected={sort === s.value} onClick={() => update({ sort: s.value === 'popular' ? undefined : s.value })}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </fieldset>
          {activeCount > 0 && (
            <Button variant="ghost" onClick={clearAll}>
              {t('common.clearAll')}
            </Button>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default ShopPage;
