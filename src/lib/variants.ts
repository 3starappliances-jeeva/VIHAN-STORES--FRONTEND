import type { Product, Sku, VariantStep } from '@/types';

export type Selection = Partial<Record<VariantStep['id'], string>>;

/** Resolve the sku for a selection: every key the sku declares must match. */
export const findSku = (product: Product, selection: Selection): Sku | undefined =>
  product.skus.find((s) => (Object.keys(s.selection) as VariantStep['id'][]).every((k) => s.selection[k] === selection[k]));

/** Initial selection = the default sku's keys plus the first option of any step the skus don't encode (e.g. audience). */
export const defaultSelection = (product: Product): Selection => {
  const d = product.skus.find((s) => s.id === product.defaultSku) ?? product.skus[0];
  const sel: Selection = { ...d.selection };
  for (const step of product.steps) if (!sel[step.id]) sel[step.id] = step.options.find((o) => !o.unavailable)?.id;
  return sel;
};
