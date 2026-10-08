import { Link } from 'react-router-dom';
import { ArrowRight, Baby, Ban, CandyOff, Check, CookingPot, HandHeart, Instagram, Leaf, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { faqs, featuredCategories, momReviews, products, recipes } from '@/data/catalogue';
import { site, whatsappLink } from '@/config/site';
import { LogoMark } from '@/components/layout/Logo';
import { cn, formatINR, percentOff } from '@/lib/utils';
import { Accordion, Button, ClayIcon, ClayMedia, ClayRing, SectionTitle, clayToneClass } from '@/components/ui';
import type { ClayGlyph, ClayTone } from '@/types';

/* ---------- categories: the pouches themselves ---------- */
/**
 * Landscape colour-blocked tiles \u2014 pouch on the left, shelf name on the right,
 * two across on a phone.
 *
 * The photo panel is white, and that is forced rather than chosen. Every pouch
 * shot is opaque and carries its own studio backdrop, so laying one straight on
 * a tint shows that backdrop as a pale rectangle with a hard edge (see
 * CREDITS.md). Giving the photo a white panel with a deep rounded inner edge
 * keeps the colour-block look while letting the backdrop disappear. Tinting
 * behind the pouch needs the photos keyed out to real transparency first.
 *
 * Heights are fixed rather than set by an aspect ratio. These tiles are flex
 * rows, a flex item takes `min-height: auto` from its content, and a portrait
 * pouch will happily push an aspect-ratio box open and leave the rows ragged.
 */

/**
 * Panel tints cycle through the palette by position rather than using each
 * category's own `tone`. Three of the first four categories are `blush`, so the
 * honest mapping paints the whole top row pink and reads as a bug. The pouch
 * photograph already carries the identity here; the tint is pure rhythm. Seven
 * tones against a 2/3/4 column grid means no two neighbours ever match.
 */
const panelTones: ClayTone[] = ['blush', 'butter', 'mint', 'lilac', 'peach', 'sky', 'cream'];

/**
 * Blurbs are written "<benefit> \u00b7 <age>". Only the age survives into a tile
 * this small, and it is the single most-asked question on infant food. Falls
 * back to nothing if a blurb is ever written to a different shape.
 */
const splitBlurb = (blurb: string) => {
  const m = /^(.*?)\s*\u00b7\s*(\d+\+\s*months)$/i.exec(blurb);
  return m ? { benefit: m[1], age: m[2] } : { benefit: blurb, age: undefined };
};

export const CategoryGrid = () => {
  const { t } = useTranslation();
  return (
    <section className="page section" aria-labelledby="cat-title">
      <SectionTitle title={<span id="cat-title">{t('home.categories')}</span>} subtitle={t('home.categoriesSub')} align="center" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {featuredCategories.map((c, i) => {
          const { age } = splitBlurb(c.blurb);
          return (
            <li key={c.slug} className="flex">
              <Link
                to={`/shop/${c.slug}`}
                className={cn(
                  'clay-flat clay-press group flex h-24 w-full items-center overflow-hidden rounded-section no-underline shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-lg sm:h-28 lg:h-32',
                  clayToneClass[panelTones[i % panelTones.length]],
                )}
              >
                <span className="relative h-full w-[44%] shrink-0 overflow-hidden rounded-r-[1.75rem] bg-white sm:rounded-r-[2.25rem]">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      loading={i < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      sizes="(min-width: 1024px) 140px, (min-width: 768px) 15vw, 22vw"
                      className="h-full w-full object-contain p-1.5 transition-transform duration-500 ease-standard group-hover:scale-105 sm:p-2"
                    />
                  ) : (
                    <ClayMedia glyph={c.glyph} tone={c.tone} />
                  )}
                </span>

                {/* Text at full tone strength. Dimming it reads nicer but takes
                    mint to 4.17:1, under AA for normal text. */}
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-2.5 py-2 sm:px-3.5">
                  <span className="line-clamp-3 font-display text-[11px] font-bold uppercase leading-[1.2] tracking-[0.02em] sm:text-caption-2 lg:text-body-1">
                    {c.name}
                  </span>
                  {age && <span className="hidden text-caption-1 sm:block">{age}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-7 flex justify-center">
        <Button to="/shop" variant="outline" className="clay-press rounded-pill px-7" iconRight={<ArrowRight size={16} />}>
          View more
        </Button>
      </div>
    </section>
  );
};

/* ---------- claim ticker ---------- */
/**
 * Bold claims band under the hero.
 *
 * Same rule as the promise ticker further down this file: every line is printed
 * on a Vihaan pouch \u2014 the badges ringing the pack artwork and the 6+ months
 * mark \u2014 and nothing here is invented for the website. An unverifiable health
 * claim on infant food is a regulatory problem, not just a copy problem.
 *
 * Unlike the other belts this one is deliberately NOT masked at the edges. Text
 * running straight off both sides is what makes it read as an endless band
 * rather than a list that happens to be moving.
 *
 * Seamless loop: the set is rendered twice and the track slides exactly half
 * its length. The trailing padding on each row has to equal the gap between
 * items, or the join shows as a wide space once per lap.
 */
const claims: { icon: LucideIcon; label: string }[] = [
  { icon: Leaf, label: '100% natural' },
  { icon: Ban, label: 'No preservatives' },
  { icon: CandyOff, label: 'No added sugar' },
  { icon: Baby, label: 'Suitable from 6+ months' },
  { icon: HandHeart, label: 'Made with love' },
  { icon: CookingPot, label: 'Homemade in small batches' },
];

const ClaimRow = ({ dup }: { dup?: boolean }) => (
  <div className="flex shrink-0 items-center gap-9 pr-9 sm:gap-14 sm:pr-14" aria-hidden={dup}>
    {claims.map(({ icon: Icon, label }) => (
      <span key={label} className="flex shrink-0 items-center gap-2.5 sm:gap-3">
        <Icon size={22} strokeWidth={2.25} className="shrink-0" aria-hidden />
        <span className="whitespace-nowrap font-display text-body-1 font-bold sm:text-body-4">{label}</span>
      </span>
    ))}
  </div>
);

/** White on the wine field measures 7.8:1 \u2014 clears AAA, not just AA. */
export const ClaimTicker = () => (
  <section className="overflow-hidden bg-brand py-3.5 text-white motion-reduce:overflow-x-auto sm:py-4" aria-label="Our promises">
    <div className="flex w-max animate-ticker hover:[animation-play-state:paused] motion-reduce:animate-none">
      <ClaimRow />
      <ClaimRow dup />
    </div>
  </section>
);

/* ---------- shop by age ---------- */
/**
 * Set `image` to a real photo (a baby eating, a toddler at the table) and the card
 * shows it in the same circular frame; until then the clay glyph stands in. Deliberately
 * not stock photography — someone else's child misrepresents the brand.
 */
const ages: { id: string; name: string; label: string; sub: string; glyph: ClayGlyph; tone: ClayTone; href: string; image?: string }[] = [
  { id: 'baby', name: 'First spoons', label: '6–12 months', sub: 'Single-ingredient powders', glyph: 'baby', tone: 'blush', href: '/shop/red-banana' , image: '/images/ages/first-spoons.jpg'},
  { id: 'toddler', name: 'Little explorers', label: '1–3 years', sub: 'Gentle malts and porridges', glyph: 'smile', tone: 'butter', href: '/shop/abc-malt' , image: '/images/ages/little-explorers.jpg'},
  { id: 'kids', name: 'School years', label: '4–12 years', sub: 'Breakfast that lasts till lunch', glyph: 'croissant', tone: 'sky', href: '/shop/abc-malt' , image: '/images/ages/school-years.jpg'},
  { id: 'family', name: 'The whole house', label: 'Adults', sub: 'Unrefined everyday staples', glyph: 'utensils', tone: 'mint', href: '/shop' , image: '/images/ages/whole-house.jpg'},
];

export const AgeGrid = () => (
  <section className="page section" aria-labelledby="age-title">
    <SectionTitle
      overline="Shop by age"
      title={<span id="age-title">The right pack for who’s eating it</span>}
      subtitle="Sized and sweetened for the person at the table"
      align="center"
    />
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {ages.map(({ id, name, label, sub, glyph, tone, href, image }) => (
        <li key={id} className="flex">
          <Link
            to={href}
            className="clay-press group flex w-full flex-col items-center gap-4 rounded-section bg-surface p-5 text-center no-underline shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-md sm:p-7"
          >
            {image ? (
              <span className="clay h-24 w-24 overflow-hidden rounded-blob transition-transform duration-300 ease-bouncy group-hover:scale-110">
                <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </span>
            ) : (
              <ClayIcon glyph={glyph} tone={tone} size="lg" className="transition-transform duration-300 ease-bouncy group-hover:scale-110" />
            )}
            <span>
              <span className="block font-display text-body-3 font-bold text-ink sm:text-title-1">{name}</span>
              <span className="mt-1 block text-caption-1 font-med uppercase tracking-wider text-brand">{label}</span>
              <span className="mt-1.5 block text-caption-2 text-muted">{sub}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

/* ---------- editorial band ---------- */
export const EditorialBand = () => (
  <section className="bg-cream section" aria-labelledby="editorial-title">
    <div className="page grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="overflow-hidden rounded-section shadow-clay-md">
        <img
          src="/images/vihaan-red-banana-feature.jpeg"
          alt="Vihaan Red Banana Powder — 100% natural, no preservatives, made with love, safe for babies from 6 months"
          loading="lazy"
          decoding="async"
          width={1240}
          height={1240}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="overline text-brand">Good food, happy tummies</p>
        <h2 id="editorial-title" className="mt-3 text-title-4 text-heading md:text-title-5">
          One ingredient. That’s the whole list.
        </h2>
        <p className="mt-4 text-body-1 text-muted md:text-body-2">
          A Vihaan pouch holds exactly one thing — red banana, or banana blossom, or sprouted ragi. Nothing is added to bulk it out, sweeten it or make it
          keep longer. Each batch is prepared fresh after your order is confirmed, in our kitchen in Arambakkam, Thiruvallur.
        </p>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {(
            [
              { glyph: 'leaf', tone: 'mint', text: '100% natural' },
              { glyph: 'shield', tone: 'sky', text: 'No preservatives' },
              { glyph: 'handHeart', tone: 'blush', text: 'Made with love' },
              { glyph: 'baby', tone: 'butter', text: 'Safe from 6+ months' },
            ] as const
          ).map((point) => (
            <li key={point.text} className="flex items-center gap-3 text-body-1 font-med text-ink">
              <ClayIcon glyph={point.glyph} tone={point.tone} size="sm" />
              {point.text}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/shop" size="lg" className="clay-press rounded-pill shadow-clay-sm">
            Shop baby food
          </Button>
          <Button to="/story" variant="outline" size="lg" className="rounded-pill" iconRight={<ArrowRight size={16} />}>
            Our story
          </Button>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- brand banner ---------- */
/**
 * Wide brand statement: the range on the left, the promise in the middle, a child
 * on the right. The collage is composed from Vihaan's own pouch photography
 * (see public/images/story/pouch-collage.jpg) rather than a stock flat-lay.
 *
 * The headline is Vihaan's own registered line from the packaging. Amber on the
 * wine field measures 4.84:1, so it clears AA for normal text, not just large.
 */
export const StorySection = () => (
  <section className="bg-brand section text-white" aria-labelledby="story-title">
    <div className="page grid grid-cols-[minmax(0,1fr)] items-center gap-9 lg:grid-cols-[0.95fr_1.05fr_0.7fr] lg:gap-10">
      <div className="order-1 overflow-hidden rounded-section bg-white shadow-clay-lg">
        <img
          src="/images/story/pouch-collage.jpg"
          alt="The Vihaan range — red banana, ABC malt, banana blossom, dry dates, ragi choco malt and sweet potato"
          loading="lazy"
          decoding="async"
          width={1100}
          height={1100}
          className="aspect-square w-full object-cover"
        />
      </div>

      <div className="order-3 text-center lg:order-2 lg:text-left">
        <LogoMark className="mx-auto h-16 w-16 lg:mx-0" />
        <h2 id="story-title" className="mt-5 font-display text-title-4 font-heavy leading-[1.08] text-lemon md:text-title-5 lg:text-title-6">
          Pure goodness.
          <br />
          Naturally.
        </h2>
        <p className="mt-4 text-body-3 text-white/90 md:text-body-4">because little tummies deserve the best</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
          <Button to="/shop" size="lg" variant="accent" className="clay-press rounded-pill shadow-clay-sm">
            Shop the range
          </Button>
          <Button to="/story" size="lg" variant="outline" className="rounded-pill border-white text-white hover:bg-white/10" iconRight={<ArrowRight size={16} />}>
            Our story
          </Button>
        </div>
      </div>

      <div className="order-2 mx-auto w-full max-w-[260px] lg:order-3 lg:max-w-none">
        <img
          src="/images/story/banner-baby.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          width={700}
          height={875}
          className="aspect-[4/5] w-full rounded-blob object-cover shadow-clay-lg"
        />
      </div>
    </div>
  </section>
);

/* ---------- promise ticker + what it does for your baby ---------- */
/**
 * Every line here is printed on a Vihaan pouch — nothing is a marketing claim
 * invented for the website. Keep it that way: an unverifiable health claim on
 * infant food is a regulatory problem, not just a copy problem.
 */
const tickerLines = [
  'Homemade in small batches',
  'Freshly prepared after every order',
  '100% natural ingredients',
  'No preservatives · no added sugar',
  'Single ingredient, nothing else',
  'Good food, happy tummies',
];

const babyBenefits: { tone: ClayTone; image: string; label: string }[] = [
  { tone: 'blush', image: '/images/benefits/first-food.jpg', label: 'A good first food' },
  { tone: 'butter', image: '/images/benefits/digest.jpg', label: 'Easy to digest' },
  { tone: 'peach', image: '/images/benefits/no-sugar.jpg', label: 'No added sugar' },
  { tone: 'mint', image: '/images/benefits/growth.jpg', label: 'Supports growth' },
  { tone: 'lilac', image: '/images/benefits/nutrients.jpg', label: 'Rich in nutrients' },
  { tone: 'sky', image: '/images/benefits/immunity.jpg', label: 'Boosts immunity' },
];

const TickerRow = () => (
  <>
    {tickerLines.map((line) => (
      <span key={line} className="flex shrink-0 items-center gap-3 px-6">
        <span className="h-2 w-2 shrink-0 rounded-full bg-lemon ring-2 ring-lemon/40" aria-hidden />
        <span className="whitespace-nowrap text-caption-2 font-med text-heading sm:text-body-1">{line}</span>
      </span>
    ))}
  </>
);

export const PromiseStrip = () => (
  <>
    {/* Ticker. Rendered twice and slid exactly half the track, so the loop never
        visibly restarts; the duplicate is hidden from assistive tech. */}
    <div className="group overflow-hidden border-y-2 border-lemon bg-surface py-3 motion-reduce:overflow-x-auto" role="region" aria-label="What we promise">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused] motion-reduce:animate-none">
        <TickerRow />
        <span className="flex" aria-hidden>
          <TickerRow />
        </span>
      </div>
    </div>

    <section className="page section" aria-labelledby="benefits-title">
      <h2 id="benefits-title" className="text-center text-title-3 md:text-title-4">
        Plant based — natural, nothing artificial
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-body-1 text-muted">
        What a single-ingredient pouch does for a growing baby
      </p>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
        {babyBenefits.map(({ tone, image, label }) => (
          <li key={label} className="group flex flex-col items-center gap-3 text-center">
            <ClayRing tone={tone} className="p-1.5 transition-transform duration-300 ease-bouncy group-hover:-translate-y-1 group-hover:scale-105">
              <img src={image} alt="" loading="lazy" decoding="async" width={256} height={256} className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24" />
            </ClayRing>
            <span className="text-caption-2 font-bold text-brand sm:text-body-1">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  </>
);

/* ---------- kits ---------- */
/**
 * Photo-forward combo cards. The imagery is composed from Vihaan's own pouch
 * shots (see public/images/kits/), so a bundle shows the exact packs that arrive
 * rather than a generic gift graphic. Contents are letterboxed on white to match
 * the product cards, since the source photos carry their own white studio
 * background.
 */
export const KitsSection = () => {
  const { t } = useTranslation();
  const kits = products.filter((p) => p.isKit);
  if (!kits.length) return null;
  return (
    <section className="bg-cream section" aria-labelledby="kits-title">
      <div className="page">
        <SectionTitle
          overline="Buy together, pay less"
          title={<span id="kits-title">{t('home.kits')}</span>}
          subtitle="Two or three pouches in one parcel, 15% below buying them separately"
          href="/shop/combos-kits"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {kits.map((k) => {
            const sku = k.skus[0];
            const off = percentOff(sku.price, sku.mrp);
            return (
              <li key={k.id} className="flex">
                <article className="group flex w-full flex-col overflow-hidden rounded-section bg-surface shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-lg">
                  <Link to={`/product/${k.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-white" tabIndex={-1} aria-hidden>
                    {k.image ? (
                      <img src={k.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-2 transition-transform duration-500 ease-standard group-hover:scale-105" />
                    ) : (
                      <ClayMedia glyph={k.glyph} tone={k.tone} />
                    )}
                    {off > 0 && (
                      <span className="absolute left-3 top-3 rounded-pill bg-brand px-3 py-1 text-caption-1 font-bold text-white shadow-clay-sm">
                        {t('product.flatOff', { pct: off })}
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <span className="inline-flex w-fit items-center rounded-pill bg-lemon px-2.5 py-0.5 text-caption-1 font-bold text-ink">{k.audience}</span>
                    <h3 className="mt-2 font-display text-title-1 font-bold text-heading">
                      <Link to={`/product/${k.slug}`} className="text-heading no-underline hover:underline">{k.name}</Link>
                    </h3>
                    <ul className="mt-3 space-y-1.5 text-caption-2 text-muted">
                      {k.kitContents?.map((c) => (
                        <li key={c} className="flex items-start gap-2">
                          <Check size={14} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {c}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
                      <div>
                        <p className="tabular font-display text-title-2 font-bold text-ink">
                          {formatINR(sku.price)} <span className="price-strike text-body-1 font-reg text-muted">{formatINR(sku.mrp)}</span>
                        </p>
                        <p className="text-caption-2 text-success-text">Save {formatINR(sku.mrp - sku.price)} vs buying separately</p>
                      </div>
                      <Button to={`/product/${k.slug}`} size="sm" className="clay-press rounded-pill shadow-clay-sm">
                        View kit
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

/* ---------- real messages from customers ---------- */
/**
 * A continuously scrolling belt of WhatsApp screenshots — the format parents
 * trust, because they read the actual conversation rather than a pull-quote.
 *
 * The belt renders the set twice and slides exactly half the track width, so the
 * second copy lands where the first began and the loop never visibly restarts.
 * The duplicate is aria-hidden, so assistive tech hears each customer once.
 *
 * A row with no `image` renders as an empty frame rather than inventing a
 * message — an unfilled placeholder can never read as a real customer.
 */
const ReviewShot = ({ shot }: { shot: (typeof momReviews)[number] }) => (
  <figure className="w-[190px] shrink-0 sm:w-[215px] lg:w-[235px]">
    <div className="overflow-hidden rounded-section bg-brand shadow-clay-md">
      <div className="m-2 mb-0 aspect-[9/16] overflow-hidden rounded-tile bg-cream">
        {shot.image ? (
          <img src={shot.image} alt={`WhatsApp message from ${shot.author}`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="grid h-full w-full place-items-center gap-2 p-4 text-center">
            <ClayIcon glyph="message" tone="mint" size="md" />
            <span className="text-caption-1 text-muted">Screenshot goes here</span>
          </div>
        )}
      </div>
      <figcaption className="px-3 py-2.5 text-center font-display text-caption-2 font-bold leading-tight text-white sm:text-body-1">
        {shot.author}
        <span className="block text-caption-1 font-med text-white/75">{shot.city}</span>
      </figcaption>
    </div>
  </figure>
);

export const Testimonials = () => (
  <section className="bg-cream section" aria-labelledby="rev-title">
    <div className="page">
      <SectionTitle
        overline="Straight from WhatsApp"
        title={<span id="rev-title">Real mums, real messages</span>}
        subtitle="Unedited screenshots from parents who ordered — shared with their permission, names and towns as they gave them."
        align="center"
      />
    </div>

    {/* Full-bleed: the belt runs past both edges so it reads as continuing, not as a list that stops. */}
    <div
      className="group relative mt-2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"
      role="region"
      aria-label="Messages from customers"
    >
      <div className="flex w-max gap-4 animate-marquee px-4 [animation-play-state:running] hover:[animation-play-state:paused] motion-reduce:animate-none">
        {momReviews.map((shot) => (
          <ReviewShot key={shot.id} shot={shot} />
        ))}
        {/* Second pass purely to make the loop seamless — hidden from assistive tech. */}
        <div className="flex gap-4" aria-hidden>
          {momReviews.map((shot) => (
            <ReviewShot key={`dup-${shot.id}`} shot={shot} />
          ))}
        </div>
      </div>
    </div>

    <p className="page mt-6 text-center text-caption-2 text-muted">
      Hover to pause · we never edit or write these messages
    </p>
  </section>
);

/* ---------- benefits ---------- */
const benefitCards: { glyph: ClayGlyph; tone: ClayTone; title: string; body: string }[] = [
  { glyph: 'leaf', tone: 'mint', title: 'One ingredient', body: 'No sugar, no preservatives, no colours, no fillers. The ingredient list is a single line.' },
  { glyph: 'handHeart', tone: 'blush', title: 'Made with love by mom', body: 'Prepared in our own kitchen in Arambakkam, Thiruvallur — not bought in and relabelled.' },
  { glyph: 'packageCheck', tone: 'sky', title: 'Freshly prepared on order', body: 'Nothing sits in a warehouse. Your pouch is filled after your order is confirmed.' },
  { glyph: 'message', tone: 'butter', title: 'Help in your language', body: `WhatsApp us in Tamil or English, ${site.supportHours}. A real person replies.` },
];

const benefitsImage: string | undefined = '/images/story/happy-baby.jpg';

/**
 * Heading sits across the full width rather than inside the right-hand column —
 * with it inside, that column always ran shorter than the photo and left dead
 * space under the cards. Pulling it out lets the photo and the 2×2 grid balance,
 * which is why the picture is 5:4 here and not the taller 4:5 it was.
 */
export const Benefits = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-brand-100/60 section" aria-labelledby="why-title">
      <div className="page">
        <SectionTitle
          overline="Why families choose us"
          title={<span id="why-title">{t('home.why')}</span>}
          subtitle="Four things we will not trade away, whatever it costs us"
          align="center"
        />

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
          <div className="relative">
            <div className="overflow-hidden rounded-section shadow-clay-lg">
              {benefitsImage ? (
                <img
                  src={benefitsImage}
                  alt="A baby of the age Vihaan powders are made for"
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={1125}
                  className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
                />
              ) : (
                <div className="aspect-[5/4]">
                  <ClayMedia glyph="handHeart" tone="blush" />
                </div>
              )}
            </div>
            {/* Lifts the picture off the flat tint and carries the one fact that matters most. */}
            <span className="clay clay-butter absolute -bottom-5 left-5 inline-flex items-center gap-2 rounded-pill px-4 py-2.5 font-display text-caption-2 font-bold sm:left-8 sm:text-body-1">
              <Check size={16} aria-hidden /> Safe from 6+ months
            </span>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-0 lg:gap-5">
            {benefitCards.map(({ glyph, tone, title, body }) => (
              <li
                key={title}
                className="flex flex-col rounded-section bg-surface p-5 shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-md sm:p-6"
              >
                <ClayIcon glyph={glyph} tone={tone} size="md" />
                <h3 className="mt-4 font-display text-body-3 font-bold text-heading">{title}</h3>
                <p className="mt-1.5 text-body-1 text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

/* ---------- recipes ---------- */
/** Not rendered on the home page at present — kept so it can be dropped back in with one line. */
export const Recipes = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-cream section" aria-labelledby="rec-title">
      <div className="page">
        <SectionTitle title={<span id="rec-title">{t('home.recipes')}</span>} subtitle={t('home.recipesSub')} href="/story" linkLabel="All kitchen notes" />
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {recipes.map((r) => (
            <article key={r.slug} className="group overflow-hidden rounded-section bg-surface shadow-clay-sm transition-all duration-200 ease-standard hover:-translate-y-1 hover:shadow-clay-md">
              <div className="aspect-[4/3] overflow-hidden">
                <span className="block h-full w-full transition-transform duration-500 ease-bouncy group-hover:scale-110">
                  <ClayMedia glyph={r.glyph} tone={r.tone} />
                </span>
              </div>
              <div className="p-5">
                <p className="text-caption-1 font-bold uppercase tracking-wider text-brand">{r.meta}</p>
                <h3 className="mt-1.5 text-body-3 text-heading">{r.title}</h3>
                <Link to="/shop" className="mt-3 inline-flex items-center gap-1 text-caption-2 font-med text-brand no-underline hover:underline">
                  Shop the ingredients <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- community band ---------- */
export const CommunityBand = () => (
  <section className="page section" aria-labelledby="community-title">
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 overflow-hidden rounded-section bg-cream shadow-clay-sm md:grid-cols-[1.1fr_1fr]">
      <div className="p-6 sm:p-10">
        <p className="overline text-brand">Good food, happy tummies</p>
        <h2 id="community-title" className="mt-3 text-title-3 text-heading md:text-title-4">
          A place to swap recipes, not sales pitches
        </h2>
        <p className="mt-3 text-body-1 text-muted md:text-body-2">
          Batch photos from the kitchen, what other parents actually cook with our pouches, and answers to the questions we get most. Follow along — or just
          say hello.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={site.social.instagram} target="_blank" size="lg" className="clay-press rounded-pill shadow-clay-sm" icon={<Instagram size={18} />}>
            Follow on Instagram
          </Button>
          <Button href={whatsappLink('Hi Vihaan, I’d like to join the community')} target="_blank" variant="outline" size="lg" className="rounded-pill" icon={<MessageCircle size={18} />}>
            Say hello on WhatsApp
          </Button>
        </div>
      </div>
      <div className="h-full">
        <img
          src="/images/vihaan-red-banana-social.jpeg"
          alt="Vihaan Natural Care red bananas beside a bowl of freshly ground red banana powder"
          loading="lazy"
          decoding="async"
          width={1240}
          height={1240}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </section>
);

/* ---------- FAQ ---------- */
export const FaqSection = () => (
  <section className="page section" aria-labelledby="faq-title">
    <div className="mx-auto max-w-3xl">
      <SectionTitle title={<span id="faq-title">Frequently asked questions</span>} subtitle="Shipping, batches, returns — the things parents ask before a first order" align="center" />
      <Accordion items={faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} defaultOpen={['faq-0']} />
      <p className="mt-6 text-center text-body-1 text-muted">
        Still unsure?{' '}
        <Link to="/help" className="font-med text-brand underline-offset-4 hover:underline">
          Visit help &amp; resolution
        </Link>
      </p>
    </div>
  </section>
);

/* ---------- WhatsApp / help band ---------- */
export const HelpBand = () => {
  const { t } = useTranslation();
  return (
    <section className="page pb-4 pt-12 md:pt-20" aria-labelledby="help-band">
      <div className="flex flex-col items-start gap-6 rounded-section bg-brand p-6 text-white shadow-clay-md md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <ClayIcon glyph="message" tone="mint" size="md" />
          <div>
            <h2 id="help-band" className="text-title-2 text-white">{t('trust.whatsapp')}</h2>
            <p className="mt-1 text-body-1 text-white/85">{t('trust.whatsappSub')} · Order help, batch questions, recipes.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={whatsappLink()} target="_blank" variant="whatsapp" size="lg" className="clay-press rounded-pill shadow-clay-sm" icon={<MessageCircle size={18} />}>
            {t('help.whatsapp')}
          </Button>
          <Button to="/help" variant="outline" size="lg" className="rounded-pill border-white text-white hover:bg-white/10">
            {t('nav.help')}
          </Button>
        </div>
      </div>
    </section>
  );
};
