import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { track } from '@/lib/analytics';
import { useProducts } from '@/hooks';
import { resolveLines, useCartStore, useCartTotals } from '@/store/cart.store';
import { Seo } from '@/components/layout';
import { Breadcrumb, Button, EmptyState } from '@/components/ui';
import { CartLineItem, FreeShippingMeter, OrderSummary, ProductRail, StepHeader, TrustStrip } from '@/components/commerce';

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const totals = useCartTotals();
  const resolved = resolveLines(lines);
  const active = resolved.filter((l) => !l.savedForLater);
  const saved = resolved.filter((l) => l.savedForLater);
  const suggestions = useProducts({ tags: ['bestseller'], pageSize: 6 });

  const checkout = () => {
    track('begin_checkout', { value: totals.total, items: totals.itemCount });
    navigate('/checkout/address');
  };

  return (
    <div className="page pb-10 pt-4">
      <Seo title={t('cart.title')} />
      <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('cart.title') }]} />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-title-3 font-med text-heading md:text-title-4">
          {t('cart.title')} {totals.itemCount > 0 && <span className="text-body-1 font-reg text-muted">· {t('cart.items', { count: totals.itemCount })}</span>}
        </h1>
        <StepHeader current="cart" />
      </div>

      {active.length === 0 ? (
        <>
          <EmptyState icon={<ShoppingBag size={28} />} title={t('cart.empty')} description={t('cart.emptySub')} action={<Button to="/shop" iconRight={<ArrowRight size={16} />}>{t('nav.shopAll')}</Button>} />
          {saved.length > 0 && (
            <section className="mt-4" aria-labelledby="saved-title">
              <h2 id="saved-title" className="text-title-1 font-med text-heading">{t('cart.savedForLater')} ({saved.length})</h2>
              <div className="card mt-3 divide-y divide-line px-4">
                {saved.map((l) => (
                  <CartLineItem key={l.lineId} line={l} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <FreeShippingMeter gap={totals.freeShippingGap} />
            <div className="card mt-4 divide-y divide-line px-4">
              {active.map((l) => (
                <CartLineItem key={l.lineId} line={l} />
              ))}
            </div>
            {saved.length > 0 && (
              <section className="mt-8" aria-labelledby="saved-title">
                <h2 id="saved-title" className="text-title-1 font-med text-heading">{t('cart.savedForLater')} ({saved.length})</h2>
                <div className="card mt-3 divide-y divide-line px-4">
                  {saved.map((l) => (
                    <CartLineItem key={l.lineId} line={l} />
                  ))}
                </div>
              </section>
            )}
            <TrustStrip className="mt-8 lg:grid-cols-2" />
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--vc-header-h)+16px)] lg:self-start">
            <OrderSummary totals={totals}>
              <Button full size="lg" onClick={checkout} iconRight={<ArrowRight size={18} />}>
                {t('cart.checkout')}
              </Button>
              <Button full variant="ghost" to="/shop" className="mt-2">
                {t('cart.continue')}
              </Button>
            </OrderSummary>
          </aside>
        </div>
      )}

      <section className="mt-14" aria-labelledby="cart-more">
        <div className="mb-6 md:mb-8">
          <h2 id="cart-more" className="text-title-3 font-med text-heading">{t('product.alsoBuy')}</h2>
        </div>
        <ProductRail products={suggestions.data?.items ?? []} loading={suggestions.isPending} label={t('product.alsoBuy')} />
      </section>
    </div>
  );
};

export default CartPage;
