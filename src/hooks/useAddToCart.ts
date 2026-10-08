import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { track } from '@/lib/analytics';
import { useCartStore } from '@/store/cart.store';
import { toast, useUiStore } from '@/store/ui.store';
import type { Product } from '@/types';

/** One place for the add-to-cart side effects: store, toast with "View cart", analytics. */
export const useAddToCart = () => {
  const add = useCartStore((s) => s.add);
  const openCart = useUiStore((s) => s.openCart);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useCallback(
    (product: Product, skuId: string, qty = 1, opts: { silent?: boolean; open?: boolean } = {}) => {
      const sku = product.skus.find((s) => s.id === skuId);
      if (!sku || sku.stock <= 0) {
        toast({ tone: 'warning', title: t('product.outOfStock'), description: `${product.name} is not available in this option right now.` });
        return false;
      }
      add(product.id, skuId, qty);
      track('add_to_cart', { item_id: skuId, item_name: product.name, quantity: qty, value: sku.price * qty });
      if (opts.open) openCart();
      else if (!opts.silent)
        toast({
          tone: 'success',
          title: `${product.shortName} added to cart`,
          description: `${sku.sizeLabel} × ${qty}`,
          action: { label: t('nav.cart'), onClick: () => navigate('/cart') },
        });
      return true;
    },
    [add, openCart, navigate, t],
  );
};
