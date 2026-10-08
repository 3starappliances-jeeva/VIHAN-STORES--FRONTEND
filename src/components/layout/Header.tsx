import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, ShoppingBag, UserRound, Wallet, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatINR } from '@/lib/utils';
import { categories, products } from '@/data/catalogue';
import { useAuthStore } from '@/store/auth.store';
import { useCartCount } from '@/store/cart.store';
import { useUiStore } from '@/store/ui.store';
import { ClayThumb, IconButton } from '@/components/ui';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { LanguageToggle } from './LanguageToggle';

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-pill px-4 text-body-1 font-med transition-colors',
    isActive ? 'bg-brand text-white shadow-1' : 'text-ink hover:bg-surface-1',
  );

/** Two-way pill toggle between the full catalogue and this week's new launches — real routes, not decoration. */
const QuickSwitch = () => {
  const { pathname } = useLocation();
  const opts = [
    { to: '/shop', label: 'Shop', match: (p: string) => p === '/shop' },
    { to: '/shop?sort=newest', label: 'New', match: (p: string) => p.startsWith('/shop?sort=newest') },
  ];
  return (
    <div className="hidden shrink-0 items-center gap-0.5 rounded-pill bg-surface-1 p-1 min-[1600px]:flex" role="group" aria-label="Quick switch">
      {opts.map((o) => {
        const active = o.match(pathname);
        return (
          <Link
            key={o.to}
            to={o.to}
            aria-current={active || undefined}
            className={cn('inline-flex h-8 items-center rounded-pill px-3 text-caption-2 font-med no-underline transition-colors', active ? 'bg-brand text-white shadow-1' : 'text-muted hover:text-ink')}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
};

/** Mega menu: opens on hover / focus / click, closes on Escape, outside click or route change. */
const MegaMenu = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const enter = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = window.setTimeout(() => setOpen(false), 160);
  };
  const bestsellers = products.filter((p) => p.tags.includes('bestseller')).slice(0, 4);
  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} className={cn(navLink({ isActive: false }), 'gap-1')}>
        {t('nav.shopByCategory')} <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-[860px] -translate-x-1/2 animate-fade-up rounded-section border border-line bg-surface p-6 shadow-3" role="region" aria-label="Shop by category">
          <div className="grid grid-cols-[1fr_260px] gap-8">
            <div>
              <p className="overline mb-3 text-brand">{t('nav.shopByCategory')}</p>
              <ul className="grid grid-cols-4 gap-3">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/shop/${c.slug}`} className="group flex flex-col gap-2 rounded-card p-2 text-ink no-underline hover:bg-surface-1">
                      <span className="media aspect-[4/3] overflow-hidden rounded-card">
                        <ClayThumb image={c.image} glyph={c.glyph} tone={c.tone} className="h-full w-full rounded-none transition-transform duration-300 group-hover:scale-105" />
                      </span>
                      <span className="text-body-1 font-med">{c.name}</span>
                      <span className="-mt-1 text-caption-1 text-muted">{c.blurb}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-l border-line pl-8">
              <p className="overline mb-3 text-brand">{t('home.bestsellers')}</p>
              <ul className="space-y-2">
                {bestsellers.map((p) => {
                  const sku = p.skus.find((s) => s.id === p.defaultSku)!;
                  return (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} className="flex items-center gap-3 rounded-card p-1.5 text-ink no-underline hover:bg-surface-1">
                        <ClayThumb image={p.image} glyph={p.glyph} tone={p.tone} className="h-11 w-11" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-1 font-med">{p.name}</span>
                          <span className="tabular block text-caption-2 text-muted">from {formatINR(sku.price)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link to="/shop" className="mt-4 inline-flex text-body-1 font-med text-brand underline-offset-4 hover:underline">
                {t('nav.shopAll')} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Header = () => {
  const { t } = useTranslation();
  const count = useCartCount();
  const customer = useAuthStore((s) => s.customer);
  const token = useAuthStore((s) => s.token);
  const openCart = useUiStore((s) => s.openCart);
  const setMobileNav = useUiStore((s) => s.setMobileNav);
  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearch = useUiStore((s) => s.setSearch);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setSearch(false), [location.pathname, setSearch]);

  return (
    <header className={cn('sticky top-0 z-40 overflow-x-clip bg-brand-100/40 backdrop-blur transition-shadow', scrolled ? 'shadow-1' : 'border-b border-line')}>
      <div className="page flex h-[var(--vc-header-h-mobile)] items-center gap-2 lg:h-[var(--vc-header-h)] lg:gap-3">
        {/* mobile: menu */}
        <IconButton label={t('nav.menu')} className="-ml-2 lg:hidden" onClick={() => setMobileNav(true)}>
          <Menu size={22} aria-hidden />
        </IconButton>

        <Logo className="shrink-0" />

        <QuickSwitch />

        {/* desktop nav */}
        <nav className="hidden shrink-0 items-center gap-0.5 rounded-pill border border-line bg-surface p-1 shadow-1 lg:flex" aria-label="Primary">
          <MegaMenu />
          <NavLink to="/shop" end className={navLink}>
            {t('nav.shopAll')}
          </NavLink>
          <NavLink to="/story" className={(a) => cn(navLink(a), 'hidden xl:inline-flex')}>
            {t('nav.story')}
          </NavLink>
          <NavLink to="/track" className={navLink}>
            {t('nav.track')}
          </NavLink>
          <NavLink to="/help" className={navLink}>
            {t('nav.help')}
          </NavLink>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 lg:gap-2">
          <SearchBar className="hidden w-60 min-[1400px]:block" />
          <IconButton label={t('nav.search')} className="min-[1400px]:hidden" onClick={() => setSearch(!searchOpen)} aria-expanded={searchOpen}>
            {searchOpen ? <X size={22} aria-hidden /> : <Search size={22} aria-hidden />}
          </IconButton>
          <LanguageToggle className="hidden md:inline-flex" />
          {token && customer ? (
            <Link to="/account" className="hidden h-10 items-center gap-2 rounded-pill px-2 text-body-1 font-med text-ink no-underline hover:bg-surface-1 lg:inline-flex" aria-label={t('nav.account')}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-deep">
                <UserRound size={18} aria-hidden />
              </span>
              {customer.walletBalance > 0 && (
                <span className="tabular inline-flex items-center gap-1 rounded-pill bg-lemon px-2 py-0.5 text-caption-1 font-med text-ink">
                  <Wallet size={12} aria-hidden /> {formatINR(customer.walletBalance)}
                </span>
              )}
            </Link>
          ) : (
            <Link to="/login" className="hidden h-10 items-center gap-1.5 rounded-pill bg-surface px-3 text-body-1 font-med text-ink no-underline shadow-1 hover:bg-surface-1 lg:inline-flex" aria-label={t('nav.login')}>
              <UserRound size={18} aria-hidden /> <span className="hidden xl:inline">{t('nav.login')}</span>
            </Link>
          )}
          <IconButton label={`${t('nav.cart')}${count ? `, ${count} items` : ''}`} badge={count} onClick={openCart} variant="outline" className="-mr-2 rounded-full bg-surface lg:mr-0">
            <ShoppingBag size={22} aria-hidden />
          </IconButton>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-line bg-surface p-3 min-[1400px]:hidden">
          <div className="page px-0">
            <SearchBar autoFocus size="md" onDone={() => setSearch(false)} />
          </div>
        </div>
      )}
    </header>
  );
};
