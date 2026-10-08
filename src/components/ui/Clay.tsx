import type { LucideIcon } from 'lucide-react';
import {
  Apple,
  Baby,
  Banana,
  Bean,
  Candy,
  Carrot,
  Cherry,
  Citrus,
  Cookie,
  Croissant,
  Dessert,
  Droplets,
  Egg,
  Gift,
  Grape,
  HandHeart,
  Heart,
  Leaf,
  MessageCircle,
  Milk,
  Nut,
  Package,
  PackageCheck,
  Salad,
  ShieldCheck,
  Smile,
  Soup,
  Sprout,
  Sun,
  Truck,
  Utensils,
  Wallet,
  Wheat,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ClayGlyph, ClayTone } from '@/types';
import { clayToneClass } from './clayTones';

export type { ClayGlyph, ClayTone };

/**
 * Claymorphism primitives.
 *
 * The visual recipe lives in globals.css (`.clay` + the `.clay-*` tone classes):
 * two inner shadows inflate the surface and one tinted outer shadow grounds it.
 * This module is just the React surface over it — a glyph registry, a
 * deterministic tone picker, and the two shapes we actually use.
 *
 * These stand in wherever there is no real photograph. Vihaan has product
 * photography for two SKUs; everything else gets a moulded icon rather than a
 * stock photo of someone else's food.
 */

const glyphs = {
  apple: Apple,
  baby: Baby,
  banana: Banana,
  bean: Bean,
  candy: Candy,
  carrot: Carrot,
  cherry: Cherry,
  citrus: Citrus,
  cookie: Cookie,
  croissant: Croissant,
  dessert: Dessert,
  droplets: Droplets,
  egg: Egg,
  gift: Gift,
  grape: Grape,
  handHeart: HandHeart,
  heart: Heart,
  leaf: Leaf,
  message: MessageCircle,
  milk: Milk,
  nut: Nut,
  package: Package,
  packageCheck: PackageCheck,
  salad: Salad,
  shield: ShieldCheck,
  smile: Smile,
  soup: Soup,
  sprout: Sprout,
  sun: Sun,
  truck: Truck,
  utensils: Utensils,
  wallet: Wallet,
  wheat: Wheat,
} satisfies Record<ClayGlyph, LucideIcon>;

const iconSizes = { sm: 'h-10 w-10', md: 'h-14 w-14', lg: 'h-20 w-20' } as const;
const glyphPx = { sm: 20, md: 28, lg: 38 } as const;

export interface ClayIconProps {
  glyph: ClayGlyph;
  tone?: ClayTone;
  size?: keyof typeof iconSizes;
  className?: string;
}

/** A puffy icon badge — the workhorse for feature lists, steps and trust rows. */
export const ClayIcon = ({ glyph, tone = 'mint', size = 'md', className }: ClayIconProps) => {
  const Glyph = glyphs[glyph];
  return (
    <span className={cn('clay grid shrink-0 place-items-center rounded-blob', clayToneClass[tone], iconSizes[size], className)} aria-hidden>
      <Glyph size={glyphPx[size]} strokeWidth={2.25} absoluteStrokeWidth />
    </span>
  );
};

/**
 * A moulded ring to sit around real photography — keeps the clay language when the
 * centre is a photo rather than a glyph. Tone classes stay private to this module.
 */
export const ClayRing = ({ tone = 'mint', className, children }: { tone?: ClayTone; className?: string; children: ReactNode }) => (
  <span className={cn('clay grid shrink-0 place-items-center rounded-full', clayToneClass[tone], className)} aria-hidden>
    {children}
  </span>
);

export interface ClayThumbProps {
  /** Real photography when the item has it. */
  image?: string;
  glyph: ClayGlyph;
  tone?: ClayTone;
  /** Accessible name; leave empty for decorative thumbnails beside a visible label. */
  alt?: string;
  /** Carries the size — e.g. "h-11 w-11". */
  className?: string;
}

/**
 * Small square thumbnail for carts, order lines, search results and nav menus.
 * One component so every list in the app makes the same photo-or-clay decision.
 */
export const ClayThumb = ({ image, glyph, tone, alt = '', className }: ClayThumbProps) => (
  <span className={cn('block shrink-0 overflow-hidden rounded-card bg-white', className)}>
    {image ? (
      // Letterboxed, not cropped: at thumbnail size the middle slice of a pouch
      // is unrecognisable, whereas the whole pack silhouette still reads.
      <img src={image} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-contain p-0.5" />
    ) : (
      <ClayMedia glyph={glyph} tone={tone} label={alt || undefined} />
    )}
  </span>
);

export interface ClayMediaProps {
  glyph: ClayGlyph;
  tone?: ClayTone;
  /** Describes what the tile stands for; omit for purely decorative use. */
  label?: string;
  className?: string;
}

/**
 * Square media tile used in place of a product photo. The glyph sits on a
 * moulded disc so cards in a grid keep a consistent silhouette whether the
 * item has photography or not.
 */
export const ClayMedia = ({ glyph, tone = 'mint', label, className }: ClayMediaProps) => {
  const Glyph = glyphs[glyph];
  return (
    <span
      className={cn('relative grid h-full w-full place-items-center overflow-hidden bg-cream-2', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Two out-of-focus blobs give the flat tile some depth without adding an image. */}
      <span className={cn('clay absolute -left-6 -top-7 h-20 w-20 rounded-blob opacity-45', clayToneClass[tone])} aria-hidden />
      <span className={cn('clay absolute -bottom-8 -right-5 h-24 w-24 rounded-blob opacity-35', clayToneClass[tone])} aria-hidden />
      <span className={cn('clay relative grid h-[58%] w-[58%] place-items-center rounded-blob', clayToneClass[tone])} aria-hidden>
        <Glyph className="h-1/2 w-1/2" strokeWidth={2.25} absoluteStrokeWidth />
      </span>
    </span>
  );
};
