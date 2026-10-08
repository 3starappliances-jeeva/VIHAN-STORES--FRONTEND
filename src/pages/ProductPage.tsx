import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Bell, Check, ChevronRight, Leaf, ShoppingBag, Sparkles, Truck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate, formatINR } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useProduct, useRelated, useReviews } from '@/hooks';
import { useAddToCart } from '@/hooks/useAddToCart';
import { categories } from '@/data/catalogue';
import { ApiError } from '@/services/api';
import { toast } from '@/store/ui.store';
import { Seo } from '@/components/layout';
import { Accordion, Badge, Breadcrumb, Button, ClayMedia, ClayThumb, EmptyState, ErrorState, PriceBlock, QuantityStepper, Rating, Skeleton, Tabs } from '@/components/ui';
import { BatchLookup, PincodeCheck, ProductRail, QABlock, ReviewSummary, UpiMarkStack, VariantSelector } from '@/components/commerce';
import { defaultSelection, findSku, type Selection } from '@/lib/variants';
import type { Product } from '@/types';

/* ---------- gallery ---------- */
const Gallery = ({ product }: { product: Product }) => {
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [product.id]);
  const imgs = product.gallery;
  return (
    <div className="lg:sticky lg:top-[calc(var(--vc-header-h)+16px)]">
      <div className="media media-contain relative aspect-square overflow-hidden rounded-section bg-white p-3 shadow-clay-sm sm:p-5">
        {imgs.length ? (
          <img key={imgs[i]} src={imgs[i]} alt={`${product.name} — photo ${i + 1} of ${imgs.length}`} className="animate-fade-up" width={800} height={800} {...{ fetchpriority: 'high' }} />
        ) : (
          /* No photography for this SKU yet — the clay tile stands in rather than a broken image. */
          <ClayMedia glyph={product.glyph} tone={product.tone} label={`${product.name} — photography coming soon`} />
        )}
        {product.isNew && <Badge tone="brand" size="md" className="absolute left-3 top-3">New</Badge>}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-btn bg-lemon px-2.5 py-1 text-caption-1 font-med text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden /> Packed this week · Batch {product.batch.id}
        </span>
      </div>
      {imgs.length > 1 && (
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Product photos">
          {imgs.map((src, k) => (
            <button key={src + k} type="button" role="tab" aria-selected={k === i} aria-label={`Photo ${k + 1}`} onClick={() => setI(k)} className={cn('media media-contain h-16 w-16 shrink-0 overflow-hidden rounded-card border-2 bg-white p-1 transition-colors sm:h-20 sm:w-20', k === i ? 'border-ink' : 'border-transparent hover:border-line-hover')}>
              <img src={src} alt="" loading="lazy" width={80} height={80} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- frequently bought together ---------- */
const BoughtTogether = ({ product, related }: { product: Product; related: Product[] }) => {
  const { t } = useTranslation();
  const addToCart = useAddToCart();
  const others = related.filter((p) => !p.isKit).slice(0, 2);
  if (!others.length) return null;
  const all = [product, ...others];
  const total = all.reduce((s, p) => s + (p.skus.find((x) => x.id === p.defaultSku)?.price ?? 0), 0);
  const mrp = all.reduce((s, p) => s + (p.skus.find((x) => x.id === p.defaultSku)?.mrp ?? 0), 0);
  return (
    <section className="card p-4 sm:p-5" aria-labelledby="fbt">
      <h2 id="fbt" className="text-title-1 font-med text-heading">{t('product.fbt')}</h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <ul className="hide-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {all.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2">
              {i > 0 && <span className="text-title-1 text-subtle" aria-hidden>+</span>}
              <Link to={`/product/${p.slug}`} className="media block h-16 w-16 shrink-0 overflow-hidden rounded-card sm:h-20 sm:w-20" aria-label={p.name}>
                <ClayThumb image={p.image} glyph={p.glyph} tone={p.tone} className="h-full w-full rounded-none" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="sm:text-right">
          <p className="tabular text-title-1 font-med text-ink">
            {formatINR(total)} <span className="price-strike text-body-1 font-reg text-muted">{formatINR(mrp)}</span>
          </p>
          <Button
            size="sm"
            className="mt-2"
            onClick={() => {
              all.forEach((p) => addToCart(p, p.defaultSku, 1, { silent: true }));
              toast({ tone: 'success', title: `${all.length} items added to cart` });
            }}
          >
            {t('product.addAll', { count: all.length })}
          </Button>
        </div>
      </div>
      <ul className="mt-3 text-caption-2 text-muted">
        {all.map((p) => (
          <li key={p.id} className="flex items-center gap-1.5">
            <Check size={14} className="text-brand" aria-hidden /> {p.name} · {p.skus.find((x) => x.id === p.defaultSku)?.sizeLabel}
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ---------- nutrition placeholder ---------- */
const nutrition = [
  ['Energy', '[value] kcal'],
  ['Protein', '[value] g'],
  ['Carbohydrate', '[value] g'],
  ['— of which sugars', '[value] g'],
  ['Fat', '[value] g'],
  ['Dietary fibre', '[value] g'],
  ['Calcium', '[value] mg'],
  ['Iron', '[value] mg'],
];

/* ---------- page ---------- */
const ProductPage = () => {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const q = useProduct(slug);
  const related = useRelated(slug);
  const reviews = useReviews(slug);
  const product = q.data;

  const [selection, setSelection] = useState<Selection>({});
  const [qty, setQty] = useState(1);
  useEffect(() => {
    if (product) {
      setSelection(defaultSelection(product));
      setQty(1);
      track('view_item', { item_id: product.id, item_name: product.name });
    }
  }, [product]);

  const sku = useMemo(() => (product ? findSku(product, selection) : undefined), [product, selection]);
  const inStock = !!sku && sku.stock > 0;
  const cat = product && categories.find((c) => c.slug === product.category);

  if (q.isError) {
    const notFound = (q.error as ApiError).status === 404;
    return (
      <div className="page py-10">
        {notFound ? (
          <EmptyState title="We can’t find that product" description="It may have been renamed or is out of season. Browse the shelves instead." action={<Button to="/shop">{t('nav.shopAll')}</Button>} />
        ) : (
          <ErrorState description={(q.error as Error).message} onRetry={() => q.refetch()} />
        )}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page grid gap-8 py-6 lg:grid-cols-2" aria-busy="true">
        <Skeleton className="aspect-square rounded-section" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const add = () => sku && addToCart(product, sku.id, qty);
  const buyNow = () => {
    if (sku && addToCart(product, sku.id, qty, { silent: true })) navigate('/checkout/address');
  };
  const notify = () => toast({ tone: 'info', title: 'We’ll let you know', description: 'You’ll get a WhatsApp message when this option is back in stock.' });

  const details = [
    { id: 'details', label: t('product.details'), content: <div className="prose-vc text-body-1 text-muted"><p>{product.description}</p><ul className="mt-3 space-y-1.5">{product.bullets.map((b) => <li key={b} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />{b}</li>)}</ul></div> },
    { id: 'use', label: t('product.howToUse'), content: (
      <div>
        <p className="text-body-1 text-muted">{product.howToUse}</p>
        {product.howToUseImage && (
          <img src={product.howToUseImage} alt={`How to prepare ${product.name}, in four steps`} loading="lazy" decoding="async" width={1163} height={912} className="mt-4 w-full rounded-section shadow-clay-sm" />
        )}
      </div>
    ) },
    { id: 'ingredients', label: t('product.ingredients'), content: <p className="text-body-1 text-muted">{product.ingredients}</p> },
    { id: 'storage', label: t('product.storage'), content: <p className="text-body-1 text-muted">{product.storage}</p> },
  ];

  return (
    <div className="page pb-10 pt-4">
      <Seo title={product.name} description={product.benefit} />
      <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.shop'), to: '/shop' }, ...(cat ? [{ label: cat.name, to: `/shop/${cat.slug}` }] : []), { label: product.shortName }]} />

      {/* minmax(0,1fr) at EVERY breakpoint, not just lg. With no explicit track the
          implicit column is `auto`, which sizes to max-content — one wide descendant
          then stretches this grid, and that widens main, .page and the whole page with it. */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery product={product} />

        <div>
          <p className="overline text-brand">{product.descriptor} · {product.audience}</p>
          <h1 className="mt-2 text-title-3 font-med text-heading md:text-title-4">{product.name}</h1>
          <p className="mt-2 text-body-1 text-muted">{product.benefit.replace('|', '·')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} size="md" />
            <a href="#reviews" className="text-caption-2 font-med text-brand underline-offset-2 hover:underline">See reviews</a>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            {sku ? <PriceBlock price={sku.price} mrp={sku.mrp} size="lg" taxes unit={`· ${sku.sizeLabel}`} /> : <p className="text-body-1 text-muted">Select options to see the price</p>}
            {sku && sku.mrp > sku.price && <Badge tone="success" size="md">Save {formatINR(sku.mrp - sku.price)}</Badge>}
          </div>

          <div className="mt-6 rounded-section border border-line p-4 sm:p-5">
            <VariantSelector product={product} selection={selection} onChange={setSelection} />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuantityStepper value={qty} onChange={setQty} max={sku ? Math.min(10, Math.max(1, sku.stock)) : 10} disabled={!inStock} />
              {inStock ? (
                <>
                  <Button size="lg" className="clay-press w-full rounded-pill shadow-clay-sm sm:w-auto sm:flex-1" icon={<ShoppingBag size={18} />} onClick={add}>
                    {t('product.addToCart')}
                  </Button>
                  <Button
                    size="lg"
                    variant="accent"
                    className="clay-press w-full rounded-pill px-5 shadow-clay-sm sm:w-auto sm:flex-1"
                    onClick={buyNow}
                    iconRight={
                      <span className="flex items-center gap-1.5">
                        <UpiMarkStack />
                        <ChevronRight size={16} />
                      </span>
                    }
                  >
                    {t('product.buyNow')}
                  </Button>
                </>
              ) : (
                <div className="flex w-full flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
                  <p className="text-body-1 font-med text-danger">{t('product.outOfStock')}</p>
                  <Button size="lg" variant="secondary" className="w-full rounded-pill sm:w-auto sm:flex-1" icon={<Bell size={18} />} onClick={notify}>
                    {t('product.notifyMe')}
                  </Button>
                </div>
              )}
            </div>
            {sku && inStock && sku.stock < 10 && <p className="mt-2 text-caption-2 font-med text-warning">Only {sku.stock} left in this batch</p>}
          </div>

          <PincodeCheck className="mt-4" />

          <ul className="mt-4 grid grid-cols-2 gap-2 text-caption-2 text-muted sm:grid-cols-4">
            {[
              { icon: <Truck size={16} />, text: t('trust.shipping') },
              { icon: <Zap size={16} />, text: 'Ships in 24 h' },
              { icon: <BadgeCheck size={16} />, text: `Batch ${product.batch.id} · exp ${formatDate(product.batch.bestBefore)}` },
              { icon: <Leaf size={16} />, text: 'Nothing added' },
            ].map((b) => (
              <li key={b.text} className="flex items-center gap-1.5 rounded-btn bg-cream px-2.5 py-2">
                <span className="text-brand" aria-hidden>{b.icon}</span> {b.text}
              </li>
            ))}
          </ul>

          {product.isKit && product.kitContents && (
            <section className="mt-6 rounded-card bg-cream p-4" aria-labelledby="kit-contents">
              <h2 id="kit-contents" className="flex items-center gap-2 text-body-1 font-med text-heading"><Sparkles size={16} className="text-brand" aria-hidden /> {t('product.whatsInside')}</h2>
              <ul className="mt-2 grid gap-1.5 text-body-1 text-muted sm:grid-cols-2">
                {product.kitContents.map((c) => (
                  <li key={c} className="flex items-center gap-2"><Check size={16} className="text-brand" aria-hidden /> {c}</li>
                ))}
              </ul>
            </section>
          )}

          <Tabs items={details} className="mt-8" />

          <Accordion
            className="mt-6"
            items={[
              {
                id: 'nutrition',
                title: t('product.whatsInside'),
                content: (
                  <div className="hide-scrollbar overflow-x-auto">
                    <table className="w-full min-w-[16rem] text-caption-2">
                      <caption className="sr-only">Nutrition per 100 g</caption>
                      <tbody>
                        {nutrition.map(([k, v]) => (
                          <tr key={k} className="border-b border-line last:border-0">
                            <th scope="row" className="py-1.5 text-left font-reg text-muted">{k}</th>
                            <td className="tabular py-1.5 text-right text-ink">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              { id: 'compliance', title: 'Good to know', content: <p>{t('product.compliance')}</p> },
            ]}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <BoughtTogether product={product} related={related.data ?? []} />
        <div id="batch">
          <BatchLookup defaultId={product.batch.id} />
        </div>
      </div>

      <div id="reviews" className="mt-12 scroll-mt-24">
        <ReviewSummary product={product} reviews={reviews.data} loading={reviews.isPending} />
      </div>
      <QABlock className="mt-12" />

      <section className="mt-12" aria-labelledby="also-title">
        <div className="mb-6 md:mb-8">
          <h2 id="also-title" className="text-title-3 font-med text-heading">{t('product.alsoBuy')}</h2>
        </div>
        <ProductRail products={related.data ?? []} loading={related.isPending} label={t('product.alsoBuy')} />
      </section>

    </div>
  );
};

export default ProductPage;
