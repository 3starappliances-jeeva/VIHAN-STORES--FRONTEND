import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { featuredCategories } from '@/data/catalogue';
import { site, whatsappLink } from '@/config/site';
import { isValidIndianMobile } from '@/lib/utils';
import { Button, ClayIcon, Input } from '@/components/ui';
import { toast } from '@/store/ui.store';
import { Logo, LogoMark } from './Logo';

const col = 'space-y-2.5 text-body-1';
const link = 'text-muted no-underline transition-colors hover:text-brand hover:underline';
const heading = 'mb-3 font-display text-body-3 font-bold text-ink';

/** Honest, text-only payment list — no borrowed brand marks. */
const payments = ['UPI', 'Cards', 'Net banking', 'Cash on delivery'];

const socials = [
  { href: site.social.instagram, label: 'Instagram', icon: <Instagram size={18} /> },
  { href: site.social.facebook, label: 'Facebook', icon: <Facebook size={18} /> },
  { href: site.social.youtube, label: 'YouTube', icon: <Youtube size={18} /> },
];

export const Footer = () => {
  const { t } = useTranslation();
  const [mobile, setMobile] = useState('');
  const [err, setErr] = useState<string>();

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidIndianMobile(mobile)) return setErr('Enter a valid 10-digit mobile number');
    setErr(undefined);
    setMobile('');
    toast({ tone: 'success', title: 'You’re on the list', description: 'We’ll message you when a new batch is packed — never more than once a week.' });
  };

  return (
    <footer className="mt-16 bg-cream pb-[calc(var(--vc-bottom-nav-total)+16px)] md:pb-0" role="contentinfo">
      {/* ---- WhatsApp signup band ---- */}
      <div className="bg-brand-deep text-white">
        <div className="page grid gap-7 py-12 md:grid-cols-2 md:items-center">
          <div className="flex items-start gap-4">
            <ClayIcon glyph="message" tone="mint" size="lg" className="hidden shrink-0 sm:grid" />
            <div>
              <p className="overline text-brand-200">WhatsApp updates</p>
              <h2 className="mt-2 text-title-3 text-white">Know when this week’s batch is packed</h2>
              <p className="mt-2 max-w-md text-body-1 text-white/80">
                One message a week, in Tamil or English. Batch dates, new launches and a recipe — no spam, unsubscribe with one reply.
              </p>
            </div>
          </div>
          <form onSubmit={subscribe} className="flex flex-col gap-2 sm:flex-row sm:items-start" noValidate>
            <Input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              aria-label="Mobile number for WhatsApp updates"
              placeholder="10-digit mobile number"
              prefix={<span className="text-ink">+91</span>}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={err}
              className="flex-1 [&_p]:text-white"
            />
            <Button type="submit" variant="whatsapp" icon={<MessageCircle size={18} />} className="clay-press shrink-0 rounded-pill shadow-clay-sm">
              Get updates
            </Button>
          </form>
        </div>
      </div>

      {/* ---- Link columns ---- */}
      <div className="page grid grid-cols-[minmax(0,1fr)] gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-body-1 text-muted">
            Single-ingredient baby powders, prepared fresh in our kitchen in {site.origin} after every order. Batch number and best-before on every pouch.
          </p>
          <p className="mt-4 font-display text-body-3 font-bold text-brand-deep">Good food, happy tummies.</p>
          <div className="mt-5 flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="clay clay-cream clay-press grid h-11 w-11 place-items-center rounded-blob transition-transform duration-200 ease-bouncy hover:-translate-y-0.5"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Shop">
          <p className={heading}>Our range</p>
          <ul className={col}>
            {featuredCategories.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`} className={link}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="font-med text-brand no-underline hover:underline">{t('nav.shopAll')} →</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Help">
          <p className={heading}>{t('nav.help')}</p>
          <ul className={col}>
            <li><Link to="/track" className={link}>{t('nav.track')}</Link></li>
            <li><Link to="/help" className={link}>Cancel or report an issue</Link></li>
            <li><Link to="/help#faq" className={link}>FAQs</Link></li>
            <li><Link to="/help#contact" className={link}>Shipping &amp; returns</Link></li>
            <li><Link to="/story" className={link}>{t('nav.story')}</Link></li>
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={link}>{t('help.whatsapp')}</a></li>
          </ul>
        </nav>

        <div>
          <p className={heading}>Talk to us</p>
          <ul className="space-y-3 text-body-1 text-muted">
            <li className="flex items-start gap-2.5">
              <Phone size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden />
              <span>
                <a href={`tel:+${site.whatsappNumber}`} className={link}>+91 93420 22499</a>
                <span className="block text-caption-2 text-subtle">{site.supportHours}</span>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden />
              <span>{site.supportEmail}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden />
              <span>{site.origin}</span>
            </li>
          </ul>
          <dl className="mt-5 space-y-1.5 rounded-tile bg-surface p-3.5 text-caption-2 shadow-clay-sm">
            <div className="flex justify-between gap-3"><dt className="text-subtle">FSSAI</dt><dd className="font-med text-ink">{site.fssai}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-subtle">GST</dt><dd className="font-med text-ink">[GST number]</dd></div>
          </dl>
        </div>
      </div>

      {/* ---- Payment + legal ---- */}
      <div className="border-t border-line/70">
        <div className="page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption-2 text-subtle">We accept</span>
            {payments.map((p) => (
              <span key={p} className="rounded-pill bg-surface px-3 py-1 text-caption-1 font-med text-ink shadow-clay-sm">{p}</span>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-caption-2">
            <li><Link to="/help#faq" className={link}>Privacy</Link></li>
            <li><Link to="/help#faq" className={link}>Terms</Link></li>
            <li><Link to="/help#faq" className={link}>Refund policy</Link></li>
            <li><Link to="/help#faq" className={link}>Shipping policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="page flex flex-col items-center gap-3 py-5 text-center text-caption-2 text-muted sm:flex-row sm:justify-between sm:text-left">
          <p className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-subtle">
            Not a substitute for breast milk. Consult your paediatrician before introducing any complementary food.
          </p>
        </div>
      </div>
    </footer>
  );
};
