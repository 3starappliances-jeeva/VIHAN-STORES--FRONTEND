# Image provenance

## Vihaan's own photography — no restrictions

All pouch shots, banners, brand posters and the logo are Vihaan's own artwork:

`*-pouch.jpg` · `banner-*.jpg` · `vihaan-red-banana-*.jpeg` · `logo.png` · `abc-malt-pack/poster.jpg`

`banner-real-food.jpg` is converted from the supplied PNG
`Vihaan Natural Care_ Real Food, Bright Futures.png` (2056×765, 2.3 MB):
resized to 1920×714 and saved as JPEG q84, 274 KB. The original PNG is still
in this folder, unreferenced — safe to delete.

### White-point correction on the eight `*-pouch.jpg` shots

Each pouch was shot on a white studio ground, but the grounds came out slightly
below pure white and slightly warm — 254,254,254 on six of them and 253,252,250
on `abc-malt` and `sweet-potato`. Against a pure-white page that reads as a faint
grey rectangle behind the pouch, with a hard edge where the photo stops — visible
anywhere a pouch sits on white, which is the category grid, the product cards and
the kit cards.

Each file has had a per-channel linear lift applied so its measured border median
lands on 255,255,255 — a factor of 1.004 on six and 1.008 on the other two. It is a
white-balance correction, not a mask: every pixel moves by the same tiny factor, so
there is no edge, step or halo anywhere, and the artwork is visually identical.
Re-encoded at JPEG q82, which left the set 29 KB *smaller* than before.

If a pouch shot is ever replaced, re-run the same correction or the rectangle
comes back. These photos can only sit on a white ground; putting one on a tint
means keying the backdrop out to real transparency first.

## Licensed stock — Unsplash

These are **placeholders standing in until Vihaan's own photography exists**. They are
licensed under the [Unsplash License](https://unsplash.com/license): free for commercial
use, no attribution required, no permission needed. Attribution below is recorded for
traceability, not obligation.

| File | Unsplash photo ID | Used for |
|---|---|---|
| `story/happy-baby.jpg` | `photo-1580749453741-5ced78eacf4f` | Benefits — "Why families choose Vihaan" |
| `story/banner-baby.jpg` | `photo-1571195927971-79e45068be9b` | Brand banner — right-hand portrait |
| `ages/first-spoons.jpg` | `photo-1544829832-c8047d6b9d89` | Shop by age — 6–12 months |
| `ages/little-explorers.jpg` | `photo-1643539541155-73134fdaa82c` | Shop by age — 1–3 years |
| `ages/school-years.jpg` | `photo-1647069325808-911db781ec93` | Shop by age — 4–12 years |
| `ages/whole-house.jpg` | `photo-1578496780896-7081cc23c111` | Shop by age — adults |
| `benefits/first-food.jpg` | `photo-1598259298632-e785684cfa90` | Benefits row — "A good first food" |
| `benefits/digest.jpg` | `photo-1631535616298-a07cf167cc9b` | Benefits row — "Easy to digest" |
| `benefits/no-sugar.jpg` | `photo-1511546865855-fe4788edf4b6` | Benefits row — "No added sugar" |
| `benefits/growth.jpg` | `photo-1457530378978-8bac673b8062` | Benefits row — "Supports growth" |
| `benefits/nutrients.jpg` | `photo-1583507171283-0d663f8416c8` | Benefits row — "Rich in nutrients" |
| `benefits/immunity.jpg` | `photo-1610415946201-295954703dd9` | Benefits row — "Boosts immunity" |

Source URL pattern: `https://images.unsplash.com/<photo-id>`

Story step 4 ("Packed after you order") deliberately uses Vihaan's **own** banner
(`banner-red-banana.jpg`) — the finished pouch is the one thing that should never be stock.

## Why these should be replaced

None of the stock images now sit beside a factual claim about Vihaan's own premises or
process — the "how it's made" step photos were removed when that section became the brand
banner. Everything remaining is illustrative (children, produce), so it is safe to keep.

`story/pouch-collage.jpg` and `kits/*.jpg` are composed from Vihaan's **own** pouch
photography, not stock.

Replacing any of them needs no code change — overwrite the file at the same path.

## Payment brand marks

`src/components/commerce/PayMarks.tsx` holds the marks.

**Google Pay** — `images/pay/googlepay.png`, the full-colour artwork supplied by
the shop owner. Derived from `images/google-pay icon.jpg` (the original upload):
cropped to the mark, resized to 128×128 and the white background keyed out to
transparency so it sits cleanly on both the white tile and the cream hover row.
Re-run that treatment if the source is ever replaced; the original JPG is kept
in `public/images/` for reference and is not referenced by any code.

**Paytm** — `images/pay/paytm.png`, the full-colour wordmark supplied by the
shop owner. Derived from `images/paytm - icon.jpg` (the original upload, a JPG
with the transparency checkerboard baked in as real pixels): cropped to the ink,
resized to 180×60 and keyed on *colourfulness* rather than brightness — the
checkerboard is neutral grey while the navy and cyan are not — so the pattern
drops out and the two-tone survives. It is a wordmark, so `PayMarks.tsx` gives it
a wider box (`aspect: 3`) instead of squeezing it into the square glyph box.

**PhonePe, Visa, Mastercard** — vector paths from
[Simple Icons](https://simpleicons.org) (**CC0 1.0** — public domain), inlined
as single-colour SVG. Simple Icons is monochrome, so Mastercard shows as one red
rather than the official two-tone; there is no RuPay or UPI entry. Supply your
own artwork for any of these the same way if you want them exact.

The CC0 licence covers the *paths*; the trademarks remain their owners'. A
merchant may display them to indicate the payment methods it accepts, which is
their sole use here. Each is shown in its own official colour and is never
recoloured, stretched or combined with other marks.

Each one is decorative — the method name is always set in real text beside it —
so they are `aria-hidden` and nothing depends on recognising the logo.

Only show a mark for a method you actually accept. Remove any you do not.
