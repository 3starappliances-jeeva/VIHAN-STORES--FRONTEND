import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------- shared wrapper ---------- */
export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
}

const Wrap = ({ id, label, hint, error, success, required, optional, className, children }: FieldProps & { id: string; children: ReactNode }) => (
  // min-w-0: an <input> carries an intrinsic ~177px default width, and a flex
  // item's default `min-width: auto` refuses to shrink below it — so a field
  // inside a flex row (pincode, batch lookup, coupon) would force the whole
  // page wider than the viewport and clip every fixed bar on the screen.
  <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
    {label && (
      <label htmlFor={id} className="text-caption-2 font-med text-ink">
        {label}
        {required && <span className="text-danger" aria-hidden> *</span>}
        {optional && <span className="font-reg text-subtle"> (optional)</span>}
      </label>
    )}
    {children}
    {error ? (
      <p id={`${id}-err`} className="flex items-start gap-1 text-caption-2 text-danger" role="alert">
        <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden /> {error}
      </p>
    ) : success ? (
      <p id={`${id}-ok`} className="flex items-start gap-1 text-caption-2 text-success-text">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-hidden /> {success}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-caption-2 text-muted">{hint}</p>
    ) : null}
  </div>
);

const control = (error?: string, success?: string) =>
  cn(
    'w-full rounded-btn border bg-surface px-3.5 text-body-1 text-ink placeholder:text-placeholder transition-colors',
    'hover:border-line-hover focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink',
    'disabled:cursor-not-allowed disabled:bg-surface-1 disabled:text-disabled',
    error ? 'border-danger focus:border-danger focus:ring-danger' : success ? 'border-success' : 'border-line',
  );

/* ---------- Input ---------- */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'>, FieldProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, success, required, optional, className, prefix, suffix, id: idProp, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  const describedBy = error ? `${id}-err` : success ? `${id}-ok` : hint ? `${id}-hint` : undefined;
  return (
    <Wrap id={id} label={label} hint={hint} error={error} success={success} required={required} optional={optional} className={className}>
      <div className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-3.5 text-body-1 text-muted">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(control(error, success), 'h-12', prefix && 'pl-12', suffix && 'pr-12')}
          {...rest}
        />
        {suffix && <span className="absolute right-3 flex items-center text-muted">{suffix}</span>}
      </div>
    </Wrap>
  );
});

/* ---------- Textarea ---------- */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, success, required, optional, className, id: idProp, rows = 4, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Wrap id={id} label={label} hint={hint} error={error} success={success} required={required} optional={optional} className={className}>
      <textarea ref={ref} id={id} rows={rows} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className={cn(control(error, success), 'py-3')} {...rest} />
    </Wrap>
  );
});

/* ---------- Select ---------- */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, success, required, optional, className, id: idProp, options, placeholder, ...rest },
  ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Wrap id={id} label={label} hint={hint} error={error} success={success} required={required} optional={optional} className={className}>
      <div className="relative">
        <select ref={ref} id={id} aria-invalid={!!error || undefined} className={cn(control(error, success), 'h-12 appearance-none pr-10')} {...rest}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      </div>
    </Wrap>
  );
});

/* ---------- Checkbox / Switch / Radio ---------- */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, className, id: idProp, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-3 text-body-1 text-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled', className)}>
      <input ref={ref} id={id} type="checkbox" className="vc-checkbox mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border border-line-strong bg-surface checked:border-brand checked:bg-brand disabled:cursor-not-allowed disabled:bg-surface-1" {...rest} />
      <span>
        <span className="font-med">{label}</span>
        {description && <span className="mt-0.5 block text-caption-2 text-muted">{description}</span>}
      </span>
    </label>
  );
});

export const Switch = forwardRef<HTMLInputElement, CheckboxProps>(function Switch({ label, description, className, id: idProp, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-center justify-between gap-4 text-body-1 text-ink', className)}>
      <span>
        <span className="font-med">{label}</span>
        {description && <span className="mt-0.5 block text-caption-2 text-muted">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input ref={ref} id={id} type="checkbox" role="switch" className="peer sr-only" {...rest} />
        <span className="h-7 w-12 rounded-pill bg-surface-2 transition-colors peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-info peer-disabled:opacity-50" aria-hidden />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-1 transition-transform peer-checked:translate-x-5" aria-hidden />
      </span>
    </label>
  );
});

export interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
}

/** Radio as a full-width selectable card — used for payment methods and delivery options. */
export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard({ title, description, icon, trailing, className, id: idProp, disabled, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-hover',
        'has-[:checked]:border-ink has-[:checked]:bg-brand-100/60 has-[:checked]:ring-1 has-[:checked]:ring-ink',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-info',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input ref={ref} id={id} type="radio" disabled={disabled} className="peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-full border border-line-strong checked:border-[6px] checked:border-brand disabled:cursor-not-allowed" {...rest} />
      {icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-surface-1 text-ink" aria-hidden>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-med text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-caption-2 text-muted">{description}</span>}
      </span>
      {trailing && <span className="shrink-0 text-caption-2 text-muted">{trailing}</span>}
    </label>
  );
});
