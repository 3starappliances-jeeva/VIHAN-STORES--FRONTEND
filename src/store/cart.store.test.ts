import { describe, expect, it, beforeEach } from 'vitest';
import { COUPONS, computeTotals, resolveLine, useCartStore } from './cart.store';
import { site } from '@/config/site';

const ragi500 = { lineId: 'ragi-malt:ragi-chocolate-jaggery-500', productId: 'ragi-malt', skuId: 'ragi-chocolate-jaggery-500', qty: 1 }; // ₹560, MRP 640
const honey250 = { lineId: 'forest-honey:forest-honey-250', productId: 'forest-honey', skuId: 'forest-honey-250', qty: 2 }; // ₹340 ×2

describe('computeTotals', () => {
  it('returns zeros for an empty cart', () => {
    const t = computeTotals({ lines: [] });
    expect(t.itemCount).toBe(0);
    expect(t.total).toBe(0);
    expect(t.shipping).toBe(0);
    expect(t.freeShippingGap).toBe(site.freeShippingThreshold);
  });

  it('sums price × qty and MRP, ignoring saved-for-later lines', () => {
    const t = computeTotals({ lines: [ragi500, { ...honey250, savedForLater: true }] });
    expect(t.itemCount).toBe(1);
    expect(t.subtotal).toBe(560);
    expect(t.mrpTotal).toBe(640);
  });

  it('charges ₹49 shipping below the threshold and none above it', () => {
    expect(computeTotals({ lines: [{ ...honey250, qty: 1 }] }).shipping).toBe(49); // 340 < 499
    expect(computeTotals({ lines: [ragi500] }).shipping).toBe(0); // 560 ≥ 499
    expect(computeTotals({ lines: [{ ...honey250, qty: 1 }] }).freeShippingGap).toBe(159);
  });

  it('applies percentage coupons with a cap', () => {
    const t = computeTotals({ lines: [ragi500, honey250], coupon: COUPONS.FIRST10 }); // 1240 → 10% = 124
    expect(t.couponDiscount).toBe(124);
    const big = computeTotals({ lines: [{ ...ragi500, qty: 10 }], coupon: COUPONS.FIRST10 }); // 5600 → 560, capped 300
    expect(big.couponDiscount).toBe(300);
  });

  it('adds the COD fee and never applies wallet on COD', () => {
    const cod = computeTotals({ lines: [ragi500], payment: 'cod', useWallet: true, walletBalance: 200 });
    expect(cod.codFee).toBe(site.codFee);
    expect(cod.walletApplied).toBe(0);
    expect(cod.total).toBe(560 + site.codFee);
  });

  it('applies wallet up to the payable amount on prepaid', () => {
    const t = computeTotals({ lines: [ragi500], payment: 'upi', useWallet: true, walletBalance: 5000 });
    expect(t.walletApplied).toBe(560);
    expect(t.total).toBe(0);
  });

  it('adds the express fee on top of shipping', () => {
    expect(computeTotals({ lines: [ragi500], express: true }).shipping).toBe(site.expressFee);
  });

  it('reports GST included, never added', () => {
    const t = computeTotals({ lines: [ragi500] });
    expect(t.gstIncluded).toBeCloseTo(560 - 560 / 1.05, 2);
    expect(t.total).toBe(560);
  });
});

describe('resolveLine', () => {
  it('builds a human variant label from the sku selection', () => {
    const r = resolveLine(ragi500);
    expect(r?.variantLabel).toBe('Chocolate · With jaggery · 500 g');
  });
  it('drops lines whose sku no longer exists', () => {
    expect(resolveLine({ ...ragi500, skuId: 'gone' })).toBeNull();
  });
});

describe('useCartStore', () => {
  beforeEach(() => useCartStore.setState({ lines: [], coupon: undefined, useWallet: false, payment: 'upi', express: false }));

  it('merges quantities for the same sku and caps at 10', () => {
    const s = useCartStore.getState();
    s.add('ragi-malt', 'ragi-chocolate-jaggery-500', 2);
    s.add('ragi-malt', 'ragi-chocolate-jaggery-500', 9);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].qty).toBe(10);
  });

  it('rejects unknown coupons and accepts known ones', () => {
    expect(useCartStore.getState().applyCoupon('NOPE').ok).toBe(false);
    expect(useCartStore.getState().applyCoupon('first10').ok).toBe(true);
    expect(useCartStore.getState().coupon?.code).toBe('FIRST10');
  });

  it('clear() keeps saved-for-later lines', () => {
    const s = useCartStore.getState();
    s.add('ragi-malt', 'ragi-chocolate-jaggery-500');
    s.add('forest-honey', 'forest-honey-250');
    s.saveForLater('forest-honey:forest-honey-250', true);
    useCartStore.getState().clear();
    expect(useCartStore.getState().lines.map((l) => l.lineId)).toEqual(['forest-honey:forest-honey-250']);
  });
});
