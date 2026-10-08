import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { site } from '@/config/site';
import { formatMobile, isValidIndianMobile } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { authApi } from '@/services/auth.api';
import { useCountdown } from '@/hooks';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { usePrefsStore } from '@/store/prefs.store';
import { Seo } from '@/components/layout';
import { Alert, Button, Checkbox, Input } from '@/components/ui';

/** OTP-only login. One mobile number is the identity — no password, no email. */
const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const token = useAuthStore((s) => s.token);
  const returnTo = useAuthStore((s) => s.returnTo);
  const setReturnTo = useAuthStore((s) => s.setReturnTo);
  const setWallet = useCartStore((s) => s.setWalletBalance);
  const lang = usePrefsStore((s) => s.lang);

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const [requestId, setRequestId] = useState<string>();
  const [resendKey, setResendKey] = useState(0);
  const left = useCountdown(30, resendKey);
  const otpRef = useRef<HTMLInputElement>(null);
  const dest = (location.state as { from?: string } | null)?.from ?? returnTo ?? '/account';

  useEffect(() => {
    if (token) navigate(dest, { replace: true });
  }, [token, dest, navigate]);

  const send = useMutation({
    mutationFn: (m: string) => authApi.sendOtp(m),
    onSuccess: (r) => {
      setRequestId(r.requestId);
      setResendKey((k) => k + 1);
      setOtp('');
      setTimeout(() => otpRef.current?.focus(), 50);
    },
  });
  const verify = useMutation({
    mutationFn: () => authApi.verifyOtp(requestId!, otp, mobile),
    onSuccess: ({ token: tok, customer }) => {
      login(tok, { ...customer, whatsappUpdates: whatsapp, language: lang });
      setWallet(customer.walletBalance);
      track('login', { method: 'otp' });
      setReturnTo(undefined);
      navigate(dest, { replace: true });
    },
  });

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    if (isValidIndianMobile(mobile)) send.mutate(mobile);
  };
  const onVerify = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) verify.mutate();
  };

  return (
    <div className="page grid min-h-[70vh] gap-10 py-8 lg:grid-cols-2 lg:items-center lg:py-14">
      <Seo title={t('auth.title')} />
      <div className="hidden overflow-hidden rounded-section bg-brand-deep text-white lg:block">
        <img src="/images/vihaan-red-banana-social.jpeg" alt="" className="h-72 w-full object-cover" loading="lazy" decoding="async" />
        <div className="p-8">
          <p className="overline text-lemon">{t('brand.name')} {t('brand.sub')}</p>
          <h2 className="mt-2 text-title-3 font-med text-white">{t('auth.noPassword')}</h2>
          <ul className="mt-6 space-y-3 text-body-1 text-white/85">
            <li className="flex gap-3"><ShieldCheck size={20} className="shrink-0 text-lemon" aria-hidden /> Order updates on WhatsApp in Tamil or English</li>
            <li className="flex gap-3"><ShieldCheck size={20} className="shrink-0 text-lemon" aria-hidden /> Saved addresses and one-tap reorder</li>
            <li className="flex gap-3"><ShieldCheck size={20} className="shrink-0 text-lemon" aria-hidden /> 2% wallet cashback on prepaid orders</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        {!requestId ? (
          <form onSubmit={onSend} className="card p-6 sm:p-8" noValidate>
            <h1 className="text-title-3 font-med text-heading">{t('auth.title')}</h1>
            <p className="mt-1 text-body-1 text-muted">{t('auth.mobileHint')}</p>
            <Input
              className="mt-6"
              label={t('auth.mobile')}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              autoFocus
              maxLength={10}
              prefix="+91"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={send.isError ? (send.error as Error).message : mobile.length === 10 && !isValidIndianMobile(mobile) ? 'Enter a valid Indian mobile number' : undefined}
            />
            <Checkbox className="mt-4" label={t('auth.whatsappUpdates')} description="Order confirmed, packed, out for delivery" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
            <Button type="submit" full size="lg" className="mt-6" loading={send.isPending} disabled={!isValidIndianMobile(mobile)}>
              {t('auth.getOtp')}
            </Button>
            <Button full variant="ghost" className="mt-2" to="/track">
              {t('auth.guest')}
            </Button>
            <p className="mt-4 text-center text-caption-1 text-subtle">By continuing you agree to our terms and privacy policy.</p>
          </form>
        ) : (
          <form onSubmit={onVerify} className="card p-6 sm:p-8" noValidate>
            <button type="button" onClick={() => setRequestId(undefined)} className="inline-flex items-center gap-1 text-caption-2 font-med text-muted hover:text-ink">
              <ArrowLeft size={14} aria-hidden /> {t('common.back')}
            </button>
            <h1 className="mt-3 text-title-3 font-med text-heading">{t('auth.enterOtp')}</h1>
            <p className="mt-1 text-body-1 text-muted">
              {t('auth.sentTo')} <span className="font-med text-ink">{formatMobile(mobile)}</span>
            </p>
            <Input
              ref={otpRef}
              className="mt-6 [&_input]:text-center [&_input]:text-title-2 [&_input]:tracking-[0.5em]"
              label="One-time code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={verify.isError ? (verify.error as Error).message : undefined}
            />
            <Alert tone="info" className="mt-3">
              {t('auth.demo', { otp: site.demoOtp })}
            </Alert>
            <Button type="submit" full size="lg" className="mt-6" loading={verify.isPending} disabled={otp.length !== 6}>
              {t('auth.verify')}
            </Button>
            <div className="mt-4 flex items-center justify-between text-caption-2">
              <span className="text-muted" aria-live="polite">{left > 0 ? t('auth.resendIn', { s: `0:${String(left).padStart(2, '0')}` }) : ' '}</span>
              <button type="button" disabled={left > 0 || send.isPending} onClick={() => send.mutate(mobile)} className="font-med text-brand underline-offset-2 hover:underline disabled:text-disabled disabled:no-underline">
                {t('auth.resend')}
              </button>
            </div>
            <a href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-caption-2 text-muted hover:text-ink">
              <MessageCircle size={14} aria-hidden /> Didn’t get the code? WhatsApp us
            </a>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
