import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, CircleHelp, LogOut, MessageCircle, PackageSearch, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categories } from '@/data/catalogue';
import { site, whatsappLink } from '@/config/site';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { ClayThumb, Drawer } from '@/components/ui';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';

/** Off-canvas navigation for phones: categories, account links, language, WhatsApp. */
export const MobileNav = () => {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNav);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, setOpen]);

  const row = 'flex items-center justify-between gap-3 px-4 py-3.5 text-body-1 font-med text-ink no-underline hover:bg-surface-1';

  return (
    <Drawer open={open} onClose={() => setOpen(false)} side="left" width="max-w-[340px]" id="mobile-nav" title={<Logo compact />}>
      <nav aria-label="Mobile">
        <div className="px-4 pb-2 pt-4">
          <LanguageToggle size="md" />
        </div>
        <p className="overline px-4 pb-1 pt-3 text-brand">{t('nav.shopByCategory')}</p>
        <ul>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link to={`/shop/${c.slug}`} className={row}>
                <span className="flex items-center gap-3">
                  <ClayThumb image={c.image} glyph={c.glyph} tone={c.tone} className="h-9 w-9" />
                  {c.name}
                </span>
                <ChevronRight size={18} className="text-subtle" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/shop" className={`${row} text-brand`}>
              {t('nav.shopAll')} <ChevronRight size={18} aria-hidden />
            </Link>
          </li>
        </ul>
        <div className="my-2 border-t border-line" />
        <ul>
          <li>
            <Link to={token ? '/account' : '/login'} className={row}>
              <span className="flex items-center gap-3"><UserRound size={20} className="text-muted" aria-hidden /> {token ? t('nav.account') : t('nav.login')}</span>
            </Link>
          </li>
          <li>
            <Link to="/track" className={row}>
              <span className="flex items-center gap-3"><PackageSearch size={20} className="text-muted" aria-hidden /> {t('nav.track')}</span>
            </Link>
          </li>
          <li>
            <Link to="/help" className={row}>
              <span className="flex items-center gap-3"><CircleHelp size={20} className="text-muted" aria-hidden /> {t('nav.help')}</span>
            </Link>
          </li>
          <li>
            <Link to="/story" className={row}>
              <span className="flex items-center gap-3"><span className="w-5 text-center text-muted" aria-hidden>✦</span> {t('nav.story')}</span>
            </Link>
          </li>
          <li>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={row}>
              <span className="flex items-center gap-3"><MessageCircle size={20} className="text-[#128c7e]" aria-hidden /> {t('trust.whatsapp')}</span>
              <span className="text-caption-1 text-muted">{site.supportHours}</span>
            </a>
          </li>
          {token && (
            <li>
              <button type="button" onClick={() => { logout(); setOpen(false); }} className={`${row} w-full text-left`}>
                <span className="flex items-center gap-3"><LogOut size={20} className="text-muted" aria-hidden /> {t('account.logout')}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </Drawer>
  );
};
