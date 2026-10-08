import { useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, CircleHelp, LogOut, MapPin, Package, RotateCcw, UserRound, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate, formatINR, formatMobile, initials } from '@/lib/utils';
import { site } from '@/config/site';
import { useOrders } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { usePrefsStore } from '@/store/prefs.store';
import { toast } from '@/store/ui.store';
import { Seo } from '@/components/layout';
import { Badge, Button, Checkbox, ClayThumb, EmptyState, Input, Skeleton, StatusBadge } from '@/components/ui';
import { AddressCard, AddressForm } from '@/components/commerce';
import type { Address } from '@/types';

const sections = [
  { id: 'orders', icon: <Package size={18} />, key: 'account.orders' },
  { id: 'addresses', icon: <MapPin size={18} />, key: 'account.addresses' },
  { id: 'wallet', icon: <Wallet size={18} />, key: 'account.wallet' },
  { id: 'profile', icon: <UserRound size={18} />, key: 'account.profile' },
] as const;
type SectionId = (typeof sections)[number]['id'];

/* ---------- orders ---------- */
const Orders = () => {
  const { t } = useTranslation();
  const q = useOrders();
  const add = useCartStore((s) => s.add);
  const navigate = useNavigate();
  const reorder = (items: { productId: string; skuId: string; qty: number }[]) => {
    items.forEach((it) => add(it.productId, it.skuId, it.qty));
    toast({ tone: 'success', title: 'Items added to cart', description: `${items.length} products from your previous order` });
    navigate('/cart');
  };
  if (q.isPending) return <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  if (!q.data?.length) return <EmptyState compact icon={<Package size={26} />} title={t('account.noOrders')} description={t('account.noOrdersSub')} action={<Button to="/shop">{t('nav.shopAll')}</Button>} />;
  return (
    <ul className="space-y-3">
      {q.data.map((o) => (
        <li key={o.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link to={`/track/${o.id}`} className="text-body-1 font-med text-ink no-underline hover:underline">{o.id}</Link>
              <p className="text-caption-2 text-muted">{formatDate(o.placedAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items · <span className="tabular">{formatINR(o.totals.total)}</span></p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {o.items.slice(0, 4).map((it) => (
              <ClayThumb key={it.skuId} image={it.image} glyph={it.glyph} tone={it.tone} alt={it.name} className="h-11 w-11" />
            ))}
            {o.items.length > 4 && <span className="text-caption-2 text-muted">+{o.items.length - 4}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" to={`/track/${o.id}`}>
              {t('nav.track')}
            </Button>
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={() => reorder(o.items)}>
              {t('account.reorder')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ---------- addresses ---------- */
const Addresses = () => {
  const addresses = useAuthStore((s) => s.addresses);
  const addAddress = useAuthStore((s) => s.addAddress);
  const removeAddress = useAuthStore((s) => s.removeAddress);
  const setDefault = useAuthStore((s) => s.setDefaultAddress);
  const customer = useAuthStore((s) => s.customer);
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {addresses.map((a) => (
          <AddressCard key={a.id} address={a} onRemove={() => removeAddress(a.id)} onMakeDefault={() => setDefault(a.id)} />
        ))}
      </div>
      {addresses.length === 0 && !adding && <p className="text-body-1 text-muted">No saved addresses yet.</p>}
      {adding ? (
        <div className="card p-4 sm:p-5">
          <h3 className="text-body-1 font-med text-heading">New address</h3>
          <AddressForm
            className="mt-4"
            defaultValues={{ recipientName: customer?.name, recipientMobile: customer?.primaryMobile }}
            onCancel={() => setAdding(false)}
            onSubmit={(v) => {
              addAddress(v as Omit<Address, 'id'>);
              setAdding(false);
              toast({ tone: 'success', title: 'Address saved' });
            }}
          />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          Add address
        </Button>
      )}
    </div>
  );
};

/* ---------- wallet ---------- */
const WalletSection = () => {
  const customer = useAuthStore((s) => s.customer)!;
  const orders = useOrders();
  const cashbacks = (orders.data ?? []).filter((o) => o.payment.method !== 'cod' && o.status !== 'cancelled');
  return (
    <div className="space-y-4">
      <div className="rounded-section bg-brand-deep p-6 text-white">
        <p className="overline text-brand-200">Wallet balance</p>
        <p className="tabular mt-2 text-title-5 font-med text-white">{formatINR(customer.walletBalance)}</p>
        <p className="mt-2 text-caption-2 text-white/80">{Math.round(site.cashbackRate * 100)}% cashback on every prepaid order, credited after delivery. Use it on the payment step.</p>
      </div>
      <section className="card p-4" aria-labelledby="wallet-hist">
        <h3 id="wallet-hist" className="text-body-1 font-med text-heading">Recent activity</h3>
        {cashbacks.length === 0 ? (
          <p className="mt-2 text-caption-2 text-muted">Cashback from prepaid orders will appear here.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line text-caption-2">
            {cashbacks.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2.5">
                <span className="text-muted">Cashback · {o.id} · {formatDate(o.placedAt)}</span>
                <span className="tabular font-med text-success-text">+ {formatINR(Math.floor(o.totals.total * site.cashbackRate))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

/* ---------- profile ---------- */
const Profile = () => {
  const { t } = useTranslation();
  const customer = useAuthStore((s) => s.customer)!;
  const update = useAuthStore((s) => s.updateCustomer);
  const lang = usePrefsStore((s) => s.lang);
  const setLang = usePrefsStore((s) => s.setLang);
  const [name, setName] = useState(customer.name);
  const [updates, setUpdates] = useState(customer.updatesMobile);
  const [wa, setWa] = useState(customer.whatsappUpdates);
  return (
    <form
      className="card space-y-5 p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        update({ name: name.trim(), updatesMobile: updates, whatsappUpdates: wa, language: lang });
        toast({ tone: 'success', title: 'Profile saved' });
      }}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-body-1 font-med text-brand-deep" aria-hidden>{initials(customer.name || 'V')}</span>
        <div>
          <p className="text-body-1 font-med text-ink">{formatMobile(customer.primaryMobile)}</p>
          <p className="text-caption-2 text-muted">Login number · member since {formatDate(customer.memberSince)}</p>
        </div>
      </div>
      <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="max-w-sm" />
      <Input label="Order updates mobile" type="tel" inputMode="numeric" maxLength={10} prefix="+91" value={updates} onChange={(e) => setUpdates(e.target.value.replace(/\D/g, '').slice(0, 10))} hint="Where confirmations and delivery messages go — can differ from your login number" className="max-w-sm" />
      <Checkbox label={t('auth.whatsappUpdates')} checked={wa} onChange={(e) => setWa(e.target.checked)} />
      <fieldset>
        <legend className="mb-2 text-caption-2 font-med text-ink">{t('checkout.language')}</legend>
        <div className="flex gap-2" role="radiogroup">
          {(['ta', 'en'] as const).map((l) => (
            <label key={l} className={cn('inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill border px-4 text-caption-2 font-med', lang === l ? 'border-ink bg-brand-100 text-ink' : 'border-line text-muted hover:border-line-hover')}>
              <input type="radio" name="plang" className="sr-only" checked={lang === l} onChange={() => setLang(l)} />
              {l === 'ta' ? 'தமிழ்' : 'English'}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
};

/* ---------- page ---------- */
const AccountPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { section = 'orders' } = useParams<{ section?: SectionId }>();
  const customer = useAuthStore((s) => s.customer)!;
  const logout = useAuthStore((s) => s.logout);
  const active = sections.find((s) => s.id === section) ?? sections[0];

  return (
    <div className="page pb-10 pt-4">
      <Seo title={t('nav.account')} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-title-3 font-med text-heading md:text-title-4">{t('account.hello', { name: customer.name || formatMobile(customer.primaryMobile) })}</h1>
          <p className="mt-1 text-body-1 text-muted">{t('account.sub')}</p>
        </div>
        <Badge tone="lemon" size="md" icon={<Wallet size={14} />}>{formatINR(customer.walletBalance)} wallet</Badge>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Account" className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {sections.map((s) => (
            <NavLink key={s.id} to={s.id === 'orders' ? '/account' : `/account/${s.id}`} end className={({ isActive }) => cn('flex shrink-0 items-center gap-2 rounded-btn px-3 py-2.5 text-body-1 font-med no-underline', isActive || active.id === s.id ? 'bg-brand-100 text-brand-deep' : 'text-muted hover:bg-surface-1 hover:text-ink')}>
              {s.icon} {t(s.key)}
              <ChevronRight size={16} className="ml-auto hidden text-subtle lg:block" aria-hidden />
            </NavLink>
          ))}
          <Link to="/help" className="flex shrink-0 items-center gap-2 rounded-btn px-3 py-2.5 text-body-1 font-med text-muted no-underline hover:bg-surface-1 hover:text-ink">
            <CircleHelp size={18} /> {t('account.help')}
          </Link>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className="flex shrink-0 items-center gap-2 rounded-btn px-3 py-2.5 text-left text-body-1 font-med text-danger hover:bg-danger-bg">
            <LogOut size={18} /> {t('account.logout')}
          </button>
        </nav>
        <section aria-labelledby="sec-title">
          <h2 id="sec-title" className="mb-4 text-title-1 font-med text-heading">{t(active.key)}</h2>
          {active.id === 'orders' && <Orders />}
          {active.id === 'addresses' && <Addresses />}
          {active.id === 'wallet' && <WalletSection />}
          {active.id === 'profile' && <Profile />}
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
