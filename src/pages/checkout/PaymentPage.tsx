import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { site } from '@/config/site';
import { formatINR, formatMobile, sleep, uid } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { usePlaceOrder } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';
import { computeTotals, resolveLines, useCartStore, useCartTotals } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { toast } from '@/store/ui.store';
import { Seo } from '@/components/layout';
import { Alert, Button, Modal, Spinner, Switch } from '@/components/ui';
import { AddressCard, OrderSummary, PaymentMethodList, type UpiApp } from '@/components/commerce';
import { CheckoutShell } from './CheckoutShell';

/** Step 3 — payment. The mock "gateway" is a 1.4 s modal; swap `simulateGateway` for Razorpay/PhonePe. */
const PaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totals = useCartTotals();
  const cart = useCartStore();
  const customer = useAuthStore((s) => s.customer)!;
  const updateCustomer = useAuthStore((s) => s.updateCustomer);
  const draft = useCheckoutStore();
  const placeOrder = usePlaceOrder();
  const [paying, setPaying] = useState(false);
  const [upiApp, setUpiApp] = useState<UpiApp>('gpay');
  const [showPrice, setShowPrice] = useState(false);
  const [error, setError] = useState<string>();
  /** set the moment an order is placed so the empty-cart guard below never fires mid-redirect */
  const placed = useRef(false);

  if (!placed.current) {
    if (totals.itemCount === 0) return <Navigate to="/cart" replace />;
    if (!draft.address || !draft.serviceability) return <Navigate to="/checkout/address" replace />;
  }

  const codAvailable = draft.serviceability?.codAvailable !== false;
  const isCod = cart.payment === 'cod';

  /* Price each option separately so the cost of the choice is visible before it is made —
     COD carries a handling fee and cannot draw on the wallet, so the two genuinely differ. */
  const totalsFor = (payment: 'upi' | 'cod') =>
    computeTotals({ lines: cart.lines, coupon: cart.coupon, useWallet: cart.useWallet, walletBalance: cart.walletBalance, payment, express: cart.express }).total;
  const prepaidTotal = totalsFor('upi');
  const codTotal = totalsFor('cod');
  const onlineSaving = Math.max(0, codTotal - prepaidTotal);

  const simulateGateway = async () => {
    await sleep(1400);
    return { reference: `${cart.payment === 'upi' ? `UPI-${upiApp.toUpperCase()}` : cart.payment.toUpperCase()}-${uid()}` };
  };

  const pay = async () => {
    setError(undefined);
    setPaying(true);
    track('add_payment_info', { method: cart.payment, value: totals.total });
    try {
      const ref = isCod ? undefined : (await simulateGateway()).reference;
      const items = resolveLines(cart.lines)
        .filter((l) => !l.savedForLater)
        .map((l) => ({ productId: l.productId, skuId: l.skuId, name: l.product.name, variant: l.variantLabel, qty: l.qty, price: l.sku.price, image: l.product.image, glyph: l.product.glyph, tone: l.product.tone }));
      const order = await placeOrder.mutateAsync({
        items,
        totals,
        address: draft.address!,
        payment: { method: cart.payment, reference: ref },
        updatesMobile: draft.updatesMobile ?? customer.primaryMobile,
        language: draft.language,
        standardDays: draft.serviceability?.standardDays ?? [3, 5],
        express: cart.express,
      });
      track('purchase', { transaction_id: order.id, value: order.totals.total, method: cart.payment });
      // wallet: deduct what was applied, add cashback for prepaid
      const cashback = isCod ? 0 : Math.floor(order.totals.total * site.cashbackRate);
      const newBalance = Math.max(0, customer.walletBalance - order.totals.walletApplied) + cashback;
      placed.current = true;
      navigate(`/checkout/confirmed/${order.id}`, { replace: true });
      updateCustomer({ walletBalance: newBalance, updatesMobile: order.updatesMobile, language: order.language });
      cart.setWalletBalance(newBalance);
      cart.clear(); // the checkout draft is reset by the confirmation page once it mounts
    } catch (e) {
      setError((e as Error).message || 'Payment could not be completed. Nothing was charged — please try again.');
      toast({ tone: 'danger', title: 'Payment failed', description: 'Nothing was charged.' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <CheckoutShell step="payment" title={t('checkout.paymentTitle')}>
      <Seo title={t('checkout.steps.payment')} />
      <div className="space-y-8 pb-28 lg:pb-0">
        <section aria-labelledby="deliver-to">
          <div className="flex items-center justify-between">
            <h2 id="deliver-to" className="text-title-1 font-med text-heading">Delivering to</h2>
            <Button variant="link" size="sm" to="/checkout/address">
              {t('product.change')}
            </Button>
          </div>
          {draft.address && <AddressCard address={draft.address} className="mt-3" />}
          <p className="mt-2 text-caption-2 text-muted">
            {cart.express ? t('checkout.express') : t('checkout.standard')} delivery · updates to {formatMobile(draft.updatesMobile ?? customer.primaryMobile)} in {draft.language === 'ta' ? 'Tamil' : 'English'}
          </p>
        </section>

        {customer.walletBalance > 0 && (
          <section className="card p-4" aria-label={t('cart.wallet')}>
            <Switch
              label={
                <span className="inline-flex items-center gap-2">
                  <Wallet size={18} className="text-brand" aria-hidden /> {t('cart.useWallet')} · {t('cart.walletBalance', { amount: formatINR(customer.walletBalance) })}
                </span>
              }
              description={isCod ? 'Wallet cannot be used with cash on delivery' : totals.walletApplied > 0 ? `${formatINR(totals.walletApplied)} will be applied` : undefined}
              checked={cart.useWallet && !isCod}
              disabled={isCod}
              onChange={(e) => cart.setUseWallet(e.target.checked)}
            />
          </section>
        )}

        <section aria-labelledby="pay-title">
          {onlineSaving > 0 && (
            <div className="scallop-bottom relative mb-6 overflow-visible rounded-t-section bg-gradient-to-r from-success-bg via-brand-100 to-success-bg px-4 py-3 text-center">
              <p className="font-display text-body-3 font-bold text-success-text">
                {formatINR(onlineSaving)} off <span className="font-med text-ink">when you pay online</span>
              </p>
            </div>
          )}
          <h2 id="pay-title" className="text-title-1 font-med text-heading">{t('checkout.payWith')}</h2>
          <PaymentMethodList
            className="mt-3"
            value={cart.payment}
            onChange={cart.setPayment}
            codAvailable={codAvailable}
            prepaidTotal={prepaidTotal}
            codTotal={codTotal}
            upiApp={upiApp}
            onUpiApp={setUpiApp}
          />
        </section>

        {error && (
          <Alert tone="danger" live title="Payment failed">
            {error}
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="inline-flex items-center gap-1.5 text-caption-2 text-muted">
            <Lock size={14} aria-hidden /> {t('checkout.secureNote')}
          </p>
          {/* Hidden on phones — the sticky bar below is the single CTA there. */}
          <Button size="lg" onClick={pay} loading={paying} className="clay-press hidden rounded-pill shadow-clay-sm lg:inline-flex lg:min-w-[260px]">
            {isCod ? t('checkout.placeCod', { amount: formatINR(totals.total) }) : t('checkout.pay', { amount: formatINR(totals.total) })}
          </Button>
        </div>
      </div>

      {/* Sticky pay bar — total on the left, one action on the right, as in the reference.
          Checkout hides the bottom nav, so this sits directly on the safe-area inset. */}
      <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-section bg-surface/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-clay-lg backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-screen-sm items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="tabular font-display text-body-4 font-bold leading-tight text-ink">{formatINR(totals.total)}</p>
            <button type="button" onClick={() => setShowPrice(true)} className="text-caption-1 font-bold uppercase tracking-wider text-brand underline-offset-2 hover:underline">
              View price details
            </button>
          </div>
          <Button size="md" onClick={pay} loading={paying} className="clay-press shrink-0 rounded-pill px-5 shadow-clay-sm">
            {isCod ? 'Place order' : t('checkout.pay', { amount: formatINR(totals.total) })}
          </Button>
        </div>
      </div>

      <Modal open={showPrice} onClose={() => setShowPrice(false)} title={t('cart.priceDetails')} size="sm">
        <OrderSummary totals={totals} />
      </Modal>

      <Modal open={paying && !isCod} onClose={() => undefined} title="Connecting to [payment gateway]" size="sm" sheet={false}>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Spinner size={32} className="text-brand" />
          <p className="text-body-1 text-muted">Do not press back or refresh. This usually takes a few seconds.</p>
        </div>
      </Modal>
    </CheckoutShell>
  );
};

export default PaymentPage;
