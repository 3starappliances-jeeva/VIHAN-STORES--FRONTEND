import type { ClayTone } from '@/types';

/**
 * Tone name to the `.clay-*` class that declares its fill, cast-shadow tint and
 * text colour (see globals.css).
 *
 * This lives apart from Clay.tsx because a file that exports both components and
 * constants breaks react-refresh, and the map is shared with the category grid.
 */
export const clayToneClass: Record<ClayTone, string> = {
  mint: 'clay-mint',
  butter: 'clay-butter',
  blush: 'clay-blush',
  sky: 'clay-sky',
  lilac: 'clay-lilac',
  peach: 'clay-peach',
  cream: 'clay-cream',
};
