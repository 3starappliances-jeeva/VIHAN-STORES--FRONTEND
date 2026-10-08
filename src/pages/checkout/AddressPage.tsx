import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Truck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { site } from '@/config/site';
import { formatEta, formatINR, formatMobile, isValidIndianMobile } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useServiceability } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { usePrefsStore } from '@/store/prefs.store';
import { Seo } from '@/components/layout';
import { Alert, Button, Checkbox, Input, RadioCard } from '@/components/ui';
import { AddressCard, AddressForm } from '@/components/commerce';
import type { Address } from '@/types';
import { CheckoutShell } from './CheckoutShell';

/**
 * Step 2 — delivery address, order-update number/language, delivery speed.
 * Journey rules: recipient mobile ≠ login mobile ≠ updates mobile; language carries through.
 */
const AddressPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totals = useCartTotals();
  const customer = useAuthStore((s) => s.customer)!;
  const addresses = useAuthStore((s) => s.addresses);
  const addAddress = useAuthStore((s) => s.addAddress);
  const removeAddress = useAuthStore((s) => s.removeAddress);
  const draft = useCheckoutStore();
  const express = useCartStore((s) => s.express);
  const setExpress = useCartStore((s) => s.setExpress);
  const lang = usePrefsStore((s) => s.lang);
  const setLang = usePrefsStore((s) => s.setLang);

  const [selectedId, setSelectedId] = useState<string | undefined>(draft.address?.id ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [differentNumber, setDifferentNumber] = useState(!!draft.updatesMobile && draft.updatesMobile !== customer.primaryMobile);
  const [updatesMobile, setUpdatesMobile] = useState(draft.updatesMobile ?? customer.updatesMobile ?? customer.primaryMobile);
  const selected = addresses.find((a) => a.id === selectedId);
  const svc = useServiceability(selected?.pincode);

  useEffect(() => {
    if (svc.data && !svc.data.expressAvailable && express) setExpress(false);
  }, [svc.data, express, setExpress]);

  if (totals.itemCount === 0) return <Navigate to="/cart" replace />;

  const eta = svc.data?.standardDays ? formatEta(new Date(), svc.data.standardDays) : undefined;
  const expressEta = formatEta(new Date(), [1, 1]);
  const updatesValid = !differentNumber || isValidIndianMobile(updatesMobile);
  const canContinue = !!selected && svc.data?.serviceable && updatesValid;

  const proceed = () => {
    if (!selected || !svc.data) return;
    draft.setAddress(selected, svc.data);
    draft.setUpdates(differentNumber ? updatesMobile : customer.primaryMobile, lang);
    track('add_shipping_info', { express, pincode: selected.pincode });
    navigate('/checkout/payment');
  };

  return (
    <CheckoutShell step="address" title={t('checkout.addressTitle')}>
      <Seo title={t('checkout.steps.address')} />
      <div className="space-y-8">
        {/* saved addresses */}
        <section aria-labelledby="addr-title">
          <div className="flex items-center justify-between">
            <h2 id="addr-title" className="text-title-1 font-med text-heading">Delivery address</h2>
            {!adding && (
              <Button variant="link" size="sm" icon={<Plus size={16} />} onClick={() => setAdding(true)}>
                Add new address
              </Button>
            )}
          </div>
          {addresses.length > 0 && !adding && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {addresses.map((a) => (
                <AddressCard key={a.id} address={a} selected={a.id === selectedId} onSelect={() => setSelectedId(a.id)} onRemove={() => removeAddress(a.id)} />
              ))}
            </div>
          )}
          {adding && (
            <div className="card mt-3 p-4 sm:p-5">
              <h3 className="text-body-1 font-med text-heading">New address</h3>
              <AddressForm
                className="mt-4"
                defaultValues={{ recipientName: customer.name || '', recipientMobile: customer.primaryMobile }}
                submitLabel="Save & deliver here"
                onCancel={addresses.length ? () => setAdding(false) : undefined}
                onSubmit={(v) => {
                  const a: Omit<Address, 'id'> = { ...v, isDefault: addresses.length === 0 };
                  const saved = addAddress(a);
                  setSelectedId(saved.id);
                  setAdding(false);
                }}
              />
            </div>
          )}
          {selected && svc.data && !svc.data.serviceable && (
            <Alert tone="danger" className="mt-3" live>
              {svc.data.reason}
            </Alert>
          )}
        </section>

        {/* delivery speed */}
        {selected && (
          <section aria-labelledby="del-title">
            <h2 id="del-title" className="text-title-1 font-med text-heading">{t('checkout.delivery')}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('checkout.delivery')}>
              <RadioCard name="delivery" checked={!express} onChange={() => setExpress(false)} icon={<Truck size={20} />} title={t('checkout.standard')} description={eta ? `${t('product.getBy', { date: eta })} · ${svc.data?.standardDays?.[0]}–${svc.data?.standardDays?.[1]} days` : 'Checking…'} trailing={totals.subtotal - totals.couponDiscount >= site.freeShippingThreshold ? t('cart.free') : formatINR(49)} />
              <RadioCard name="delivery" checked={express} disabled={!svc.data?.expressAvailable} onChange={() => setExpress(true)} icon={<Zap size={20} />} title={t('checkout.express')} description={svc.data?.expressAvailable ? `${t('product.getBy', { date: expressEta })} · next day` : 'Not available for this pincode'} trailing={`+ ${formatINR(site.expressFee)}`} />
            </div>
          </section>
        )}

        {/* order updates */}
        <section aria-labelledby="upd-title">
          <h2 id="upd-title" className="text-title-1 font-med text-heading">{t('checkout.updates')}</h2>
          <div className="card mt-3 space-y-4 p-4 sm:p-5">
            <div>
              <p className="text-body-1 font-med text-ink">{t('checkout.updatesTo', { mobile: formatMobile(customer.primaryMobile) })}</p>
              <p className="text-caption-2 text-muted">{t('checkout.updatesSub')}</p>
            </div>
            <Checkbox label={t('checkout.differentNumber')} checked={differentNumber} onChange={(e) => setDifferentNumber(e.target.checked)} />
            {differentNumber && (
              <Input label="Updates mobile" type="tel" inputMode="numeric" maxLength={10} prefix="+91" value={updatesMobile} onChange={(e) => setUpdatesMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} error={!updatesValid && updatesMobile.length === 10 ? 'Enter a valid Indian mobile number' : undefined} hint="For example, the person receiving the parcel" className="max-w-sm" />
            )}
            <fieldset>
              <legend className="mb-2 text-caption-2 font-med text-ink">{t('checkout.language')}</legend>
              <div className="flex gap-2" role="radiogroup">
                {(['ta', 'en'] as const).map((l) => (
                  <label key={l} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill border px-4 text-caption-2 font-med ${lang === l ? 'border-ink bg-brand-100 text-ink' : 'border-line text-muted hover:border-line-hover'}`}>
                    <input type="radio" name="lang" className="sr-only" checked={lang === l} onChange={() => setLang(l)} />
                    {l === 'ta' ? 'தமிழ்' : 'English'}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" to="/cart">
            {t('common.back')}
          </Button>
          <Button size="lg" onClick={proceed} disabled={!canContinue} loading={!!selected && svc.isPending} iconRight={<ArrowRight size={18} />}>
            {t('checkout.continuePayment')}
          </Button>
        </div>
      </div>
    </CheckoutShell>
  );
};

export default AddressPage;
