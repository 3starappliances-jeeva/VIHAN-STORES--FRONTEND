import { NavLink, useLocation } from 'react-router-dom';
import { House, PackageSearch, ShoppingBag, Store, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useCartCount } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

/** Phone-only bottom navigation (hidden during checkout so the pay button owns the thumb zone). */
export const BottomNav = () => {
  const { t } = useTranslation();
  const count = useCartCount();
  const token = useAuthStore((s) => s.token);
  const openCart = useUiStore((s) => s.openCart);
  const { pathname } = useLocation();
  if (pathname.startsWith('/checkout') || pathname === '/login') return null;

  const item = ({ isActive }: { isActive: boolean }) =>
    cn('flex h-full flex-1 flex-col items-center justify-center gap-1 text-[11px] font-med no-underline', isActive ? 'text-brand' : 'text-muted');

  return (
    /* Height includes the home-indicator inset, so the padding that clears it
       doesn't eat into the 64px the five targets need. */
    <nav className="fixed inset-x-0 bottom-0 z-40 h-[var(--vc-bottom-nav-total)] border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden" aria-label="Bottom">
      <div className="flex h-full">
        <NavLink to="/" end className={item}>
          <House size={22} aria-hidden /> {t('nav.home')}
        </NavLink>
        <NavLink to="/shop" className={item}>
          <Store size={22} aria-hidden /> {t('nav.shop')}
        </NavLink>
        <button type="button" onClick={openCart} className={item({ isActive: false })} aria-label={`${t('nav.cart')}${count ? `, ${count} items` : ''}`}>
          <span className="relative">
            <ShoppingBag size={22} aria-hidden />
            {count > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-pill bg-brand px-1 text-[10px] text-white" aria-hidden>{count}</span>}
          </span>
          {t('nav.cart')}
        </button>
        <NavLink to="/track" className={item}>
          <PackageSearch size={22} aria-hidden /> {t('nav.orders')}
        </NavLink>
        <NavLink to={token ? '/account' : '/login'} className={item}>
          <UserRound size={22} aria-hidden /> {token ? t('nav.account') : t('nav.login')}
        </NavLink>
      </div>
    </nav>
  );
};
