import { useMemo } from 'react';
import { Chip } from '@/components/ui';
import { findSku, type Selection } from '@/lib/variants';
import type { Product, VariantStep } from '@/types';

export interface VariantSelectorProps {
  product: Product;
  selection: Selection;
  onChange: (next: Selection) => void;
}

/**
 * Multi-step variant picker (reference: "Who is it for? → flavour → type → size").
 * Options that cannot be combined with the rest of the selection stay visible but disabled
 * with a reason; sizes carry a per-100 g meta line.
 */
export const VariantSelector = ({ product, selection, onChange }: VariantSelectorProps) => {
  const encoded = useMemo(() => new Set(product.skus.flatMap((s) => Object.keys(s.selection))), [product]);

  const availability = (step: VariantStep, optionId: string): string | undefined => {
    const opt = step.options.find((o) => o.id === optionId);
    if (opt?.unavailable) {
      // only block when the reason actually applies to the current selection
      const trial = { ...selection, [step.id]: optionId };
      if (!findSku(product, trial)) return opt.unavailable;
      return undefined;
    }
    if (!encoded.has(step.id)) return undefined;
    const trial = { ...selection, [step.id]: optionId };
    return findSku(product, trial) ? undefined : 'Not available with this combination';
  };

  return (
    <div className="space-y-5">
      {product.steps.map((step, i) => {
        const current = selection[step.id];
        const label = step.options.find((o) => o.id === current)?.label;
        return (
          <fieldset key={step.id}>
            <legend className="mb-2.5 flex items-baseline gap-2 text-body-1 font-med text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-caption-1 text-white" aria-hidden>
                {i + 1}
              </span>
              {step.label}
              {label && <span className="text-caption-2 font-reg text-muted">· {label}</span>}
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={step.label}>
              {step.options.map((o) => {
                const reason = availability(step, o.id);
                const sku = step.id === 'size' ? findSku(product, { ...selection, size: o.id }) : undefined;
                const outOfStock = sku && sku.stock <= 0 ? 'Out of stock' : undefined;
                return (
                  <Chip
                    key={o.id}
                    role="radio"
                    aria-checked={current === o.id}
                    selected={current === o.id}
                    swatch={o.swatch}
                    meta={outOfStock ?? o.meta}
                    unavailable={reason}
                    className={outOfStock ? 'text-muted' : undefined}
                    shape={step.id === 'size' ? 'tile' : 'pill'}
                    onClick={() => !reason && onChange({ ...selection, [step.id]: o.id })}
                  >
                    {o.label}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
};
