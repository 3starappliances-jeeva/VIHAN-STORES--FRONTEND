// ---------- Claymorphic icon system ----------
/**
 * Pastel fills for the moulded-clay surfaces. Defined here rather than in the
 * component so catalogue data can reference them without importing React.
 */
export type ClayTone = 'mint' | 'butter' | 'blush' | 'sky' | 'lilac' | 'peach' | 'cream';

/** Keys into the glyph registry in components/ui/Clay.tsx, which must cover this union exactly. */
export type ClayGlyph =
  | 'apple'
  | 'baby'
  | 'banana'
  | 'bean'
  | 'candy'
  | 'carrot'
  | 'cherry'
  | 'citrus'
  | 'cookie'
  | 'croissant'
  | 'dessert'
  | 'droplets'
  | 'egg'
  | 'gift'
  | 'grape'
  | 'handHeart'
  | 'heart'
  | 'leaf'
  | 'message'
  | 'milk'
  | 'nut'
  | 'package'
  | 'packageCheck'
  | 'salad'
  | 'shield'
  | 'smile'
  | 'soup'
  | 'sprout'
  | 'sun'
  | 'truck'
  | 'utensils'
  | 'wallet'
  | 'wheat';

// ---------- Catalogue ----------
/**
 * Vihaan sells a short range of single-ingredient baby powders, so a "category"
 * here is a product line — one pouch, one shelf. `pantry` holds the wider
 * store-cupboard items that aren't part of the baby-food range.
 */
export type CategorySlug =
  | 'red-banana'
  | 'banana-blossom'
  | 'abc-malt'
  | 'sweet-potato'
  | 'dry-dates'
  | 'karuppu-ulunthu'
  | 'ragi-choco-malt'
  | 'health-mix'
  | 'sprouted-ragi'
  | 'combos-kits'
  | 'pantry';

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Real photography where it exists; otherwise the clay tile stands in. */
  image?: string;
  glyph: ClayGlyph;
  tone?: ClayTone;
  blurb: string;
}

export interface VariantOption {
  id: string;
  label: string;
  /** shown as a second line on the chip, e.g. "₹112 / 100 g" */
  meta?: string;
  /** unavailable options stay visible with a reason (never hidden) */
  unavailable?: string;
  swatch?: string;
}

export interface VariantStep {
  id: 'audience' | 'flavour' | 'type' | 'size';
  label: string;
  options: VariantOption[];
}

export interface Sku {
  id: string;
  /** selected option id per step id */
  selection: Partial<Record<VariantStep['id'], string>>;
  price: number;
  mrp: number;
  stock: number;
  sizeLabel: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  author: string;
  city: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: CategorySlug;
  descriptor: string;
  audience: string;
  benefit: string;
  description: string;
  bullets: string[];
  howToUse: string;
  /** Optional step-by-step preparation diagram shown in the "How to use" tab. */
  howToUseImage?: string;
  ingredients: string;
  storage: string;
  /** Only the SKUs we have actually photographed carry an image. */
  image?: string;
  gallery: string[];
  glyph: ClayGlyph;
  tone?: ClayTone;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isKit?: boolean;
  kitContents?: string[];
  steps: VariantStep[];
  skus: Sku[];
  /** default sku id */
  defaultSku: string;
  tags: string[];
  batch: { id: string; milled: string; packed: string; bestBefore: string };
}

// ---------- Cart ----------
export interface CartLine {
  lineId: string; // productId + skuId
  productId: string;
  skuId: string;
  qty: number;
  savedForLater?: boolean;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number; // sum of price × qty
  mrpTotal: number;
  couponDiscount: number;
  shipping: number;
  codFee: number;
  walletApplied: number;
  gstIncluded: number;
  total: number;
  freeShippingGap: number; // ₹ left to unlock free shipping (0 when unlocked)
}

// ---------- Customer ----------
export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  recipientMobile: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  /** login mobile — identity */
  primaryMobile: string;
  /** where order updates go — can differ from primaryMobile */
  updatesMobile: string;
  language: 'ta' | 'en';
  whatsappUpdates: boolean;
  walletBalance: number;
  memberSince: string;
}

// ---------- Orders ----------
export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface OrderItem {
  productId: string;
  skuId: string;
  name: string;
  variant: string;
  qty: number;
  price: number;
  /** Snapshot of the product photo, when that product has one. */
  image?: string;
  glyph: ClayGlyph;
  tone?: ClayTone;
}

export interface Order {
  id: string;
  placedAt: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string }[];
  items: OrderItem[];
  totals: CartTotals;
  address: Address;
  payment: { method: PaymentMethod; reference?: string; captured: boolean };
  updatesMobile: string;
  language: 'ta' | 'en';
  courier?: { name: string; awb?: string; eta: string };
  cancellable: boolean;
}

export interface Serviceability {
  pincode: string;
  serviceable: boolean;
  area?: string;
  city?: string;
  state?: string;
  standardDays?: [number, number];
  expressAvailable?: boolean;
  codAvailable?: boolean;
  reason?: string;
}

export interface BatchReport {
  batchId: string;
  product: string;
  milled: string;
  packed: string;
  bestBefore: string;
  tests: { name: string; result: string; limit: string; pass: boolean }[];
}
