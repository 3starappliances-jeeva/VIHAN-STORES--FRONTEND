import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, House, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatMobile } from '@/lib/utils';
import { useServiceability } from '@/hooks';
import { Badge, Button, Input, Select } from '@/components/ui';
import { addressSchema, type AddressFormValues } from '@/lib/schemas';
import type { Address, Serviceability } from '@/types';

/* ---------- card ---------- */
export interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onMakeDefault?: () => void;
  className?: string;
}

const labelIcon = { Home: <House size={16} />, Work: <Briefcase size={16} />, Other: <MapPin size={16} /> };

export const AddressCard = ({ address, selected, onSelect, onEdit, onRemove, onMakeDefault, className }: AddressCardProps) => {
  const selectable = !!onSelect;
  const Tag = selectable ? 'label' : 'div';
  return (
    <Tag
      className={cn(
        'card relative flex gap-3 p-4 transition-colors',
        selectable && 'cursor-pointer hover:border-line-hover',
        selected && 'border-ink bg-brand-100/50 ring-1 ring-ink',
        className,
      )}
    >
      {selectable && <input type="radio" name="address" checked={!!selected} onChange={onSelect} className="mt-1 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-full border border-line-strong checked:border-[6px] checked:border-brand" aria-label={`Deliver to ${address.recipientName}, ${address.line1}`} />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-1 font-med text-ink">{address.recipientName}</span>
          <Badge tone="neutral" icon={labelIcon[address.label]}>{address.label}</Badge>
          {address.isDefault && <Badge tone="brand">Default</Badge>}
        </div>
        <p className="mt-1 text-body-1 text-muted">
          {address.line1}, {address.line2}
          <br />
          {address.city}, {address.state} – {address.pincode}
        </p>
        <p className="mt-1 text-caption-2 text-muted">Mobile: {formatMobile(address.recipientMobile)}</p>
        {(onEdit || onRemove || onMakeDefault) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {onEdit && (
              <Button size="sm" variant="ghost" className="h-9 px-2 text-caption-2" icon={<Pencil size={14} />} onClick={onEdit}>
                Edit
              </Button>
            )}
            {onMakeDefault && !address.isDefault && (
              <Button size="sm" variant="ghost" className="h-9 px-2 text-caption-2" onClick={onMakeDefault}>
                Make default
              </Button>
            )}
            {onRemove && (
              <Button size="sm" variant="ghost" className="h-9 px-2 text-caption-2 text-danger" icon={<Trash2 size={14} />} onClick={onRemove}>
                Remove
              </Button>
            )}
          </div>
        )}
      </div>
    </Tag>
  );
};

/* ---------- form ---------- */
export interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues, serviceability?: Serviceability) => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
  /** called whenever a serviceability result arrives (checkout uses it for delivery options) */
  onServiceability?: (s?: Serviceability) => void;
}

const states = ['Tamil Nadu', 'Puducherry', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Other'];

/** Address form with live pincode serviceability (auto-fills city/state where known). */
export const AddressForm = ({ defaultValues, onSubmit, onCancel, submitLabel = 'Save address', loading, className, onServiceability }: AddressFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema), defaultValues: { label: 'Home', state: 'Tamil Nadu', ...defaultValues }, mode: 'onBlur' });
  const pincode = watch('pincode');
  const svc = useServiceability(/^\d{6}$/.test(pincode ?? '') ? pincode : undefined);

  useEffect(() => {
    onServiceability?.(svc.data);
    if (svc.data?.serviceable) {
      if (svc.data.city && svc.data.city !== 'India' && svc.data.city !== 'South India') setValue('city', svc.data.city, { shouldValidate: true });
      if (svc.data.state) setValue('state', svc.data.state, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc.data]);

  const pinStatus = svc.isFetching
    ? { hint: 'Checking delivery…' }
    : svc.data?.serviceable
      ? { success: `Delivers in ${svc.data.standardDays?.[0]}–${svc.data.standardDays?.[1]} days${svc.data.area ? ` · ${svc.data.area}` : ''}${svc.data.codAvailable ? ' · COD available' : ' · prepaid only'}` }
      : svc.data
        ? { error: svc.data.reason ?? 'Not serviceable' }
        : {};

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v, svc.data))} className={cn('grid gap-4 sm:grid-cols-2', className)} noValidate>
      <Input label={t('checkout.recipientName')} required autoComplete="name" error={errors.recipientName?.message} {...register('recipientName')} />
      <Input label={t('checkout.recipientMobile')} required type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} prefix="+91" hint={t('checkout.recipientMobileHint')} error={errors.recipientMobile?.message} {...register('recipientMobile', { setValueAs: (v: string) => v.replace(/\D/g, '').slice(-10) })} />
      <Input label={t('checkout.pincode')} required inputMode="numeric" maxLength={6} autoComplete="postal-code" error={errors.pincode?.message ?? pinStatus.error} success={pinStatus.success} hint={pinStatus.hint} {...register('pincode', { setValueAs: (v: string) => v.replace(/\D/g, '').slice(0, 6) })} />
      <Select label={t('checkout.addressType')} options={[{ value: 'Home', label: 'Home' }, { value: 'Work', label: 'Work' }, { value: 'Other', label: 'Other' }]} error={errors.label?.message} {...register('label')} />
      <Input label={t('checkout.line1')} required autoComplete="address-line1" className="sm:col-span-2" error={errors.line1?.message} {...register('line1')} />
      <Input label={t('checkout.line2')} required autoComplete="address-line2" className="sm:col-span-2" error={errors.line2?.message} {...register('line2')} />
      <Input label={t('checkout.city')} required autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
      <Select label={t('checkout.state')} required options={states.map((s) => ({ value: s, label: s }))} error={errors.state?.message} {...register('state')} />
      <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading || isSubmitting} disabled={svc.data ? !svc.data.serviceable : false}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
