import { describe, expect, it } from 'vitest';
import { compactCount, formatINR, isValidIndianMobile, isValidPincode, maskMobile, percentOff, perUnit } from './utils';
import { defaultSelection, findSku } from './variants';
import { products } from '@/data/catalogue';

describe('formatINR', () => {
  it('uses Indian grouping with the symbol tight to the digits', () => {
    expect(formatINR(1840)).toBe('₹1,840');
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(26.67, true)).toBe('₹26.67');
  });
});

describe('percentOff', () => {
  it('floors the discount and suppresses non-discounts', () => {
    expect(percentOff(560, 640)).toBe(12);
    expect(percentOff(640, 640)).toBe(0);
    expect(percentOff(700, 640)).toBe(0);
  });
  it('formats per-100 g price', () => {
    expect(perUnit(560, 500)).toBe('₹112 / 100 g');
  });
});

describe('validators', () => {
  it('accepts Indian mobiles starting 6–9 only', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
    expect(isValidIndianMobile('1234567890')).toBe(false);
  });
  it('validates 6-digit pincodes not starting with 0', () => {
    expect(isValidPincode('600042')).toBe(true);
    expect(isValidPincode('012345')).toBe(false);
  });
  it('masks mobiles for display', () => {
    expect(maskMobile('9876543210')).toBe('+91 98••• ••210');
  });
  it('compacts counts', () => {
    expect(compactCount(1204)).toBe('1.2K');
    expect(compactCount(2000)).toBe('2K');
    expect(compactCount(410)).toBe('410');
  });
});

describe('variants', () => {
  const ragi = products.find((p) => p.id === 'ragi-malt')!;
  it('starts from the default sku and fills non-encoded steps', () => {
    const sel = defaultSelection(ragi);
    expect(sel).toMatchObject({ flavour: 'chocolate', type: 'jaggery', size: '500', audience: 'kids-2-6' });
    expect(findSku(ragi, sel)?.id).toBe('ragi-chocolate-jaggery-500');
  });
  it('returns undefined for impossible combinations (2 kg chocolate)', () => {
    expect(findSku(ragi, { flavour: 'chocolate', type: 'jaggery', size: '2000' })).toBeUndefined();
    expect(findSku(ragi, { flavour: 'original', type: 'jaggery', size: '2000' })?.price).toBe(1840);
  });
});
