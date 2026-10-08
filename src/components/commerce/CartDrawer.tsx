import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatINR } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { resolveLines, useCartStore, useCartTotals } from '@/store/cart.store';
import { useUiStore } from '@/store/ui.store';
import { Button, Drawer, EmptyState } from '@/components/ui';
import { CartLineItem } from './CartLineItem';
import { FreeShippingMeter } from './TrustStrip';

/** Slide-over mini cart: quick edits, free-shipping meter, checkout CTA. Full page at /cart. */
export const CartDrawer = () => {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const totals = useCartTotals();
  const navigate = useNavigate();
  const active = resolveLines(lines).filter((l) => !l.savedForLater);

  const go = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      id="cart-drawer"
      title={
        <span className="inline-flex items-center gap-2">
          {t('cart.title')} {totals.itemCount > 0 && <span className="text-caption-2 font-reg text-muted">· {t('cart.items', { count: totals.itemCount })}</span>}
        </span>
      }
      footer={
        active.length > 0 ? (
          <div className="space-y-3">
            <FreeShippingMeter gap={totals.freeShippingGap} />
            <div className="flex items-center justify-between text-body-1">
              <span className="text-muted">{t('cart.total')}</span>
              <span className="tabular text-title-1 font-med text-ink">{formatINR(totals.total)}</span>
            </div>
            <Button
              full
              size="lg"
              onClick={() => {
                track('begin_checkout', { value: totals.total, items: totals.itemCount });
                go('/checkout/address');
              }}
            >
              {t('cart.checkout')}
            </Button>
            <Button full variant="ghost" onClick={() => go('/cart')}>
              View full cart
            </Button>
          </div>
        ) : undefined
      }
    >
      {active.length === 0 ? (
        <EmptyState
          compact
          icon={<ShoppingBag size={26} />}
          title={t('cart.empty')}
          description={t('cart.emptySub')}
          action={
            <Button onClick={() => go('/shop')} variant="primary">
              {t('nav.shopAll')}
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-line px-4">
          {active.map((l) => (
            <CartLineItem key={l.lineId} line={l} compact />
          ))}
        </div>
      )}
    </Drawer>
  );
};
