import { useState, type FormEvent } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatEta, isValidPincode } from '@/lib/utils';
import { useServiceability } from '@/hooks';
import { usePrefsStore } from '@/store/prefs.store';
import { Button, Input, Spinner } from '@/components/ui';

/** Product-page delivery estimate. The pincode is remembered for checkout. */
export const PincodeCheck = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const saved = usePrefsStore((s) => s.pincode);
  const setPincode = usePrefsStore((s) => s.setPincode);
  const [editing, setEditing] = useState(!saved);
  const [value, setValue] = useState(saved ?? '');
  const [err, setErr] = useState<string>();
  const q = useServiceability(saved);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPincode(value)) return setErr('Enter a valid 6-digit pincode');
    setErr(undefined);
    setPincode(value);
    setEditing(false);
  };

  return (
    <div className={cn('rounded-card border border-line p-3.5', className)}>
      {editing || !saved ? (
        <form onSubmit={submit} className="flex items-start gap-2" noValidate>
          <Input
            aria-label={t('checkout.pincode')}
            placeholder="Enter pincode for delivery date"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            prefix={<MapPin size={18} />}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={err}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            {t('checkout.check')}
          </Button>
        </form>
      ) : (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-brand" aria-hidden>
            {q.isPending ? <Spinner size={18} /> : <Truck size={20} />}
          </span>
          <div className="min-w-0 flex-1 text-body-1">
            <p className="font-med text-ink">
              {t('product.deliverTo', { pincode: saved })}
              {q.data?.area && <span className="font-reg text-muted"> · {q.data.area}</span>}
            </p>
            {q.isPending && <p className="text-caption-2 text-muted">Checking delivery…</p>}
            {q.isError && <p className="text-caption-2 text-danger">Could not check right now — try again.</p>}
            {q.data && q.data.serviceable && q.data.standardDays && (
              <p className="text-caption-2 text-muted">
                <span className="text-success-text">{t('product.getBy', { date: formatEta(new Date(), q.data.standardDays) })}</span>
                {q.data.codAvailable ? ' · Cash on delivery available' : ' · Prepaid only'}
                {q.data.expressAvailable && ' · Express available'}
              </p>
            )}
            {q.data && !q.data.serviceable && <p className="text-caption-2 text-danger">{q.data.reason}</p>}
          </div>
          <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-caption-2 font-med text-brand underline-offset-2 hover:underline">
            {t('product.change')}
          </button>
        </div>
      )}
    </div>
  );
};
