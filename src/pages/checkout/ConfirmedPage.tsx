import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ChefHat, Download, MessageCircle, PackageCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { whatsappLink } from '@/config/site';
import { formatDate, formatINR, formatMobile } from '@/lib/utils';
import { useOrder, useProducts } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { toast } from '@/store/ui.store';
import { Seo } from '@/components/layout';
import { Button, ClayThumb, ErrorState, Skeleton, StatusBadge } from '@/components/ui';
import { ProductRail, StepHeader } from '@/components/commerce';

/** Step 4 — confirmation. Mirrors the reference's "thank you" pattern with a what-happens-next timeline. */
const ConfirmedPage = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const q = useOrder(id);
  const customer = useAuthStore((s) => s.customer);
  const more = useProducts({ tags: ['bestseller'], pageSize: 6 });
  const resetDraft = useCheckoutStore((s) => s.reset);
  const order = q.data;
  useEffect(() => resetDraft(), [resetDraft]);

  if (q.isError) return <div className="page py-10"><ErrorState description={(q.error as Error).message} /></div>;

  const eta = order?.courier?.eta ? formatDate(order.courier.eta) : '—';
  const steps = [
    { icon: <ChefHat size={18} />, title: t('confirmed.next1'), sub: t('confirmed.next1Sub') },
    { icon: <Truck size={18} />, title: t('confirmed.next2'), sub: t('confirmed.next2Sub') },
    { icon: <PackageCheck size={18} />, title: t('confirmed.next3', { date: eta }), sub: t('confirmed.next3Sub') },
  ];

  return (
    <div className="page pb-10 pt-5">
      <Seo title="Order confirmed" />
      <StepHeader current="done" />
      {!order ? (
        <div className="mt-6 space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>
      ) : (
        <>
          <section className="mt-6 rounded-section bg-success-bg p-6 text-center sm:p-10" aria-live="polite">
            <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden />
            <h1 className="mt-4 text-title-3 font-med text-heading md:text-title-4">{t('confirmed.title', { name: customer?.name ? `, ${customer.name}` : '' })}</h1>
            <p className="mt-2 text-body-1 text-muted">
              Order <span className="font-med text-ink">{order.id}</span> · {formatDate(order.placedAt, true)} · <StatusBadge status={order.status} />
            </p>
            <p className="mt-1 text-body-1 text-muted">{t('confirmed.updatesLine', { mobile: formatMobile(order.updatesMobile), lang: order.language === 'ta' ? 'Tamil' : 'English' })}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button to={`/track/${order.id}`}>{t('confirmed.track')}</Button>
              <Button variant="outline" icon={<Download size={16} />} onClick={() => toast({ tone: 'info', title: 'Invoice on its way', description: 'The PDF invoice will be sent to your WhatsApp. [Connect invoice service]' })}>
                {t('confirmed.invoice')}
              </Button>
              <Button variant="ghost" to="/shop">{t('confirmed.continue')}</Button>
            </div>
          </section>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_360px]">
            <section className="card p-5" aria-labelledby="next-title">
              <h2 id="next-title" className="text-title-1 font-med text-heading">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-deep" aria-hidden>{s.icon}</span>
                    <div>
                      <p className="text-body-1 font-med text-ink">{i + 1}. {s.title}</p>
                      <p className="text-caption-2 text-muted">{s.sub}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a href={whatsappLink(`Hi, about my order ${order.id}`)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-caption-2 font-med text-brand hover:underline">
                <MessageCircle size={14} aria-hidden /> Questions? WhatsApp us with your order number
              </a>
            </section>
            <section className="card p-5" aria-labelledby="ord-title">
              <h2 id="ord-title" className="text-title-1 font-med text-heading">{t('checkout.summary')}</h2>
              <ul className="mt-3 divide-y divide-line">
                {order.items.map((it) => (
                  <li key={it.skuId} className="flex items-center gap-3 py-2.5">
                    <ClayThumb image={it.image} glyph={it.glyph} tone={it.tone} className="h-11 w-11" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption-2 font-med text-ink">{it.name}</span>
                      <span className="block text-caption-1 text-muted">{it.variant} × {it.qty}</span>
                    </span>
                    <span className="tabular text-caption-2 font-med">{formatINR(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-caption-2">
                <div className="flex justify-between text-muted"><dt>Paid via</dt><dd className="uppercase">{order.payment.method}{order.payment.reference ? ` · ${order.payment.reference}` : ' · on delivery'}</dd></div>
                <div className="flex justify-between text-muted"><dt>Deliver to</dt><dd className="text-right">{order.address.recipientName}, {order.address.pincode}</dd></div>
                <div className="flex justify-between text-body-1 font-med text-ink"><dt>{t('cart.total')}</dt><dd className="tabular">{formatINR(order.totals.total)}</dd></div>
              </dl>
            </section>
          </div>
        </>
      )}
      <section className="mt-14" aria-labelledby="more-title">
        <div className="mb-6 md:mb-8"><h2 id="more-title" className="text-title-3 font-med text-heading">{t('product.alsoBuy')}</h2></div>
        <ProductRail products={more.data?.items ?? []} loading={more.isPending} label={t('product.alsoBuy')} />
      </section>
    </div>
  );
};

export default ConfirmedPage;
