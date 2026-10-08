import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface BannerPanel {
  id: string;
  image: string;
  alt: string;
  /** Tint sampled from the creative — what shows while the image loads. */
  bg: string;
  href: string;
  /**
   * Overlay button. Omitted when the creative paints its own, in which case the
   * whole slide becomes the target and `linkLabel` names it — stacking a second
   * button on top of a painted one looks like a mistake.
   */
  cta?: string;
  linkLabel?: string;
  /**
   * Where to anchor the crop. The container can only have one aspect ratio, so a
   * creative wider than it loses its edges; one with the message banked to the
   * left has to be pinned left or the headline is the first thing to go.
   */
  objectClass?: string;
}

/**
 * Every slide is one of Vihaan's own finished banner creatives. The artwork
 * already carries its headline, so a slide adds nothing but a CTA — and not
 * even that when the creative paints its own button.
 *
 * The desktop container is 1920/714 (2.69:1) because that is the widest
 * creative. It used to be 21/9, which cut 136px off each side of the Real Food
 * banner — through the Vihaan logo and the SHOP NOW button on the left, and the
 * "Healthy Babies Happier Families" script on the right. Widening it instead
 * costs the two 2.36:1 creatives about 6% of their height, top and bottom,
 * which is foliage and floor rather than type. One rail means one aspect ratio,
 * so this is a trade, not a free choice: measure before changing it.
 *
 * There is deliberately no arrow/dot chrome. The slides advance on their own,
 * and overlaid controls landed on the creatives' own type while a strip beneath
 * them was clutter under a banner that needs no driving. Nothing is trapped: the
 * rail is a snap scroller, so touch and trackpad swipe it, and tabbing moves
 * through each slide's own link, which scrolls that slide into the rail.
 */
const panels: BannerPanel[] = [
  {
    id: 'real-food',
    image: '/images/banner-real-food.jpg',
    alt:
      'Vihaan Natural Care — Real Food for Real Growth. The range: Dry Dates, Red Banana, Health Mix, Ragi Choco Malt and Karuppu Ulunthu Kanji powders. 100% natural, no preservatives, no added sugar, made with love.',
    bg: 'bg-[#f1e8de]',
    href: '/shop',
    // The creative paints its own SHOP NOW, so no overlay button here.
    linkLabel: 'Shop the full Vihaan range',
    // 2.69:1 against a 4/3 phone box: pinned left keeps the logo, headline,
    // claims and painted button, and spends the crop on the right-hand photo.
    objectClass: 'object-left lg:object-center',
  },
  {
    id: 'nendran-banana',
    image: '/images/banner-nendran-banana.jpg',
    alt: 'Vihaan Nendran Banana Powder, 200g, suitable from 6+ months — a natural energy booster',
    bg: 'bg-[#e9e1d2]',
    // The Nendran line was retired in favour of Banana Blossom, but the artwork
    // is kept per instruction — so this points at the range rather than a dead product URL.
    href: '/shop',
    cta: 'Shop the range',
  },
  {
    id: 'ragi-powder',
    image: '/images/banner-ragi-powder.jpg',
    alt: 'Sprouted Ragi Powder, 200g — rich in potassium and fibre, 100% natural, no preservatives',
    bg: 'bg-[#c69277]',
    href: '/product/ragi-malt',
    cta: 'Shop Ragi',
  },
];

/** Full-bleed hero carousel — one creative fills the viewport width at a time. */
export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  /** Autoplay only runs while the hero is actually on screen. */
  const onScreenRef = useRef(true);

  /**
   * The only thing that ever scrolls the rail — dots, arrows and autoplay all funnel through here.
   *
   * This sets `scrollLeft` on the rail and nothing else. It must never use
   * scrollIntoView(): that scrolls *every* scrollable ancestor including the
   * document, so once the reader had scrolled past the hero each autoplay tick
   * dragged the whole page back up to it. Every slide is exactly one rail-width
   * wide, so slide i always starts at i × clientWidth.
   */
  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const idx = (i + panels.length) % panels.length;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: idx * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  };

  // Tracks which slide is most in view so autoplay resumes from wherever a swipe
  // left off, rather than snapping back. It must never itself trigger a scroll,
  // or it fights with goTo() and the rail keeps "correcting" itself.
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const idx = cardRefs.current.findIndex((el) => el === entry.target);
          if (idx !== -1 && entry.intersectionRatio > bestRatio) {
            bestIdx = idx;
            bestRatio = entry.intersectionRatio;
          }
        });
        if (bestIdx !== -1) activeRef.current = bestIdx;
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Don't animate a carousel nobody is looking at — it burns battery and, more
  // importantly, means a stray tick can never disturb a reader further down the page.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (onScreenRef.current = entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = trackRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pause = () => (pausedRef.current = true);
    const resume = () => (pausedRef.current = false);
    // Pointer covers mouse; focus covers keyboard users tabbing onto a slide CTA.
    root.addEventListener('pointerenter', pause);
    root.addEventListener('pointerleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', resume);
    const id = window.setInterval(() => {
      if (!pausedRef.current && onScreenRef.current) goTo(activeRef.current + 1);
    }, 5500);
    return () => {
      window.clearInterval(id);
      root.removeEventListener('pointerenter', pause);
      root.removeEventListener('pointerleave', resume);
      root.removeEventListener('focusin', pause);
      root.removeEventListener('focusout', resume);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden" aria-label="Promotions">
      <div ref={trackRef} className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory" role="region" aria-roledescription="carousel">
        {panels.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => (cardRefs.current[i] = el)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${panels.length}`}
            className={cn('relative aspect-[4/3] w-full shrink-0 snap-start overflow-hidden sm:aspect-[2/1] lg:aspect-[1920/714]', p.bg)}
          >
            <img
              src={p.image}
              alt={p.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              /* React 18 drops the camelCase prop, so spread the real lowercase attribute. */
              {...(i === 0 ? { fetchpriority: 'high' } : {})}
              decoding="async"
              width={1400}
              height={600}
              className={cn('absolute inset-0 h-full w-full object-cover', p.objectClass ?? 'object-center')}
            />
            {p.cta ? (
              <>
                {/* The creatives carry their own type, so this scrim exists only to keep the CTA legible. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#211c16]/70 to-transparent sm:h-40" aria-hidden />
                <div className="page pointer-events-none absolute inset-x-0 bottom-5 sm:bottom-8">
                  <Button to={p.href} size="md" className="clay-press pointer-events-auto w-fit rounded-pill px-7 shadow-clay-md">
                    {p.cta}
                  </Button>
                </div>
              </>
            ) : (
              /* No scrim either — there is no overlaid text to keep legible, and
                 darkening the foot of the artwork would only dull its own button. */
              <Link to={p.href} aria-label={p.linkLabel} className="absolute inset-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
