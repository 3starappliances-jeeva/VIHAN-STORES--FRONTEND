import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, FlaskConical, MessageCircle, ShieldCheck, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { site, whatsappLink } from '@/config/site';
import { formatDate, formatINR, formatMobile, isValidIndianMobile } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useAdvanceOrder, useCancelOrder, useOrder, useTrackOrder } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';
import { useTrackStore } from '@/store/track.store';
import { toast } from '@/store/ui.store';
import { Seo } from '@/components/layout';
import { Alert, Breadcrumb, Button, ClayThumb, Input, Modal, Skeleton, StatusBadge } from '@/components/ui';
import { OrderTimeline } from '@/components/commerce';
import type { Order } from '@/types';

/* ---------- guest lookup form ---------- */
const GuestForm = ({ initialId = '' }: { initialId?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const remember = useTrackStore((s) => s.remember);
  const [id, setId] = useState(initialId);
  const [mobile, setMobile] = useState('');
  const m = useTrackOrder();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !isValidIndianMobile(mobile)) return;
    m.mutate(
      { id: id.trim().toUpperCase(), mobile },
      {
        onSuccess: (o) => {
          remember(o);
          navigate(`/track/${o.id}`);
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6" noValidate>
      <h2 className="text-title-1 font-med text-heading">{t('track.guestTitle')}</h2>
      <p className="mt-1 text-body-1 text-muted">{t('track.guestSub')}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input label={t('track.orderNumber')} placeholder="ORD-26-01834" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} autoCapitalize="characters" required />
        <Input label={t('track.mobile')} type="tel" inputMode="numeric" maxLength={10} prefix="+91" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} hint="The number that receives order updates" required />
      </div>
      {m.isError && (
        <Alert tone="danger" className="mt-4" live>
          {(m.error as Error).message}
        </Alert>
      )}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1.5 text-caption-2 text-muted">
          <ShieldCheck size={14} className="text-brand" aria-hidden /> {t('track.privacy')}
        </p>
        <Button type="submit" loading={m.isPending} disabled={!id.trim() || !isValidIndianMobile(mobile)} iconRight={<ArrowRight size={16} />}>
          {t('track.button')}
        </Button>
      </div>
    </form>
  );
};

/* ---------- order detail ---------- */
const OrderDetail = ({ order, guest }: { order: Order; guest: boolean }) => {
  const { t } = useTranslation();
  const cancel = useCancelOrder();
  const advance = useAdvanceOrder();
  const updateGuest = useTrackStore((s) => s.update);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const canCancel = order.cancellable && ['placed', 'confirmed'].includes(order.status);

  const doCancel = () =>
    cancel.mutate(order.id, {
      onSuccess: (o) => {
        updateGuest(o);
        setConfirmCancel(false);
        track('cancel_order', { order_id: o.id });
        toast({ tone: 'success', title: 'Order cancelled', description: order.payment.captured ? 'Refund will reach the original payment method in 5–7 working days.' : 'Nothing was charged.' });
      },
      onError: (e) => {
        setConfirmCancel(false);
        toast({ tone: 'danger', title: 'Could not cancel', description: (e as Error).message });
      },
    });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card p-5" aria-labelledby="status-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="status-title" className="text-title-1 font-med text-heading">Order {order.id}</h2>
              <p className="mt-0.5 text-caption-2 text-muted">Placed {formatDate(order.placedAt, true)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <OrderTimeline order={order} className="mt-6" />
          {order.courier && order.status !== 'cancelled' && (
            <p className="mt-6 rounded-card bg-cream p-3 text-caption-2 text-muted">
              {order.courier.name}
              {order.courier.awb ? ` · AWB ${order.courier.awb}` : ''} · {order.status === 'delivered' ? 'Delivered' : `Expected by ${formatDate(order.courier.eta)}`}
            </p>
          )}
          {site.useMockApi && (
            <div className="mt-4 flex items-center gap-2 text-caption-1 text-subtle">
              <FlaskConical size={14} aria-hidden /> Demo:
              <button type="button" onClick={() => advance.mutate(order.id, { onSuccess: updateGuest })} disabled={advance.isPending || ['delivered', 'cancelled'].includes(order.status)} className="font-med text-brand underline-offset-2 hover:underline disabled:text-disabled">
                advance status →
              </button>
            </div>
          )}
        </section>

        {/* cancel */}
        <section className={`rounded-card border p-5 ${canCancel ? 'border-line' : 'border-warning-line bg-warning-bg'}`} aria-labelledby="cancel-title">
          <h2 id="cancel-title" className="text-body-1 font-med text-heading">{canCancel ? t('track.cancelOk') : order.status === 'cancelled' ? t('status.cancelled') : t('track.cancelClosed')}</h2>
          <p className="mt-1 text-caption-2 text-muted">{canCancel ? t('track.cancelOkSub') : order.status === 'cancelled' ? 'This order was cancelled.' : t('track.cancelClosedSub')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canCancel && (
              <Button variant="outline" size="sm" icon={<XCircle size={16} />} onClick={() => setConfirmCancel(true)}>
                {t('track.cancel')}
              </Button>
            )}
            <Button href={whatsappLink(`Hi, I need help with order ${order.id}`)} target="_blank" variant="whatsapp" size="sm" icon={<MessageCircle size={16} />}>
              {t('help.whatsapp')}
            </Button>
            {!canCancel && order.status !== 'cancelled' && (
              <Button to="/help" variant="ghost" size="sm">
                Report a problem
              </Button>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="card p-5" aria-labelledby="items-title">
          <h2 id="items-title" className="text-body-1 font-med text-heading">Items</h2>
          <ul className="mt-3 divide-y divide-line">
            {order.items.map((it) => (
              <li key={it.skuId} className="flex items-center gap-3 py-2.5">
                <ClayThumb image={it.image} glyph={it.glyph} tone={it.tone} className="h-11 w-11" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-caption-2 font-med text-ink">{it.name}</span>
                  <span className="block text-caption-1 text-muted">{it.variant} × {it.qty}</span>
                </span>
                {!guest && <span className="tabular text-caption-2 font-med">{formatINR(it.price * it.qty)}</span>}
              </li>
            ))}
          </ul>
          {!guest ? (
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-caption-2">
              <div className="flex justify-between text-muted"><dt>Payment</dt><dd className="uppercase">{order.payment.method}</dd></div>
              <div className="flex justify-between text-muted"><dt>Deliver to</dt><dd className="text-right">{order.address.recipientName}, {order.address.pincode}</dd></div>
              <div className="flex justify-between text-muted"><dt>Updates to</dt><dd>{formatMobile(order.updatesMobile)}</dd></div>
              <div className="flex justify-between text-body-1 font-med text-ink"><dt>{t('cart.total')}</dt><dd className="tabular">{formatINR(order.totals.total)}</dd></div>
            </dl>
          ) : (
            <p className="mt-3 border-t border-line pt-3 text-caption-1 text-subtle">{t('track.privacy')}. <Link to="/login">Log in</Link> to see the full order.</p>
          )}
        </section>
      </aside>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this order?"
        description={order.payment.captured ? `The ${formatINR(order.totals.total)} refund goes back to your original payment method in 5–7 working days.` : 'Nothing has been charged for this order.'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep order
            </Button>
            <Button variant="danger" onClick={doCancel} loading={cancel.isPending}>
              Yes, cancel order
            </Button>
          </>
        }
      />
    </div>
  );
};

/* ---------- page ---------- */
const TrackPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const token = useAuthStore((s) => s.token);
  const verified = useTrackStore((s) => s.verified);
  const q = useOrder(token && id ? id : undefined);
  const guestOrder = id ? verified[id] : undefined;
  const order = token ? q.data : guestOrder;

  return (
    <div className="page pb-10 pt-4">
      <Seo title={t('track.title')} />
      <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('track.title') }]} />
      <div className="mt-4 mb-6">
        <h1 className="text-title-3 font-med text-heading md:text-title-4">{t('track.title')}</h1>
        <p className="mt-1 text-body-1 text-muted">{t('track.sub')}</p>
      </div>

      {id && order ? (
        <OrderDetail order={order} guest={!token} />
      ) : id && token && q.isPending ? (
        <div className="space-y-4"><Skeleton className="h-56" /><Skeleton className="h-24" /></div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {id && token && q.isError && <Alert tone="danger" live>{(q.error as Error).message}</Alert>}
            <GuestForm initialId={id} />
          </div>
          <aside className="card p-5">
            <h2 className="text-body-1 font-med text-heading">Have an account?</h2>
            <p className="mt-1 text-caption-2 text-muted">Log in with your mobile number to see every order, reorder in one tap and cancel without typing anything.</p>
            <Button to="/login" variant="outline" className="mt-4" full>
              {t('nav.login')}
            </Button>
            <p className="mt-5 text-body-1 font-med text-ink">{t('track.needHelp')}</p>
            <Button href={whatsappLink()} target="_blank" variant="whatsapp" className="mt-2" full icon={<MessageCircle size={18} />}>
              {t('help.whatsapp')}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default TrackPage;
