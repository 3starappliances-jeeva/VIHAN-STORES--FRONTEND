import type { Config } from 'tailwindcss';

/**
 * Tailwind is wired to the athena tokens declared in src/styles/tokens.css,
 * so `bg-brand`, `text-ink`, `rounded-card` etc. all resolve to CSS variables.
 * Change a token once in tokens.css and every screen follows.
 *
 * Tokens are stored as "R G B" triplets, not hex — `withOpacity` below wraps
 * them as `rgb(var(--x) / <alpha>)`, which is what lets an opacity modifier
 * like `bg-brand/40` work. Passing a bare `var(--x)` string (the old setup)
 * silently drops any class that adds a `/NN` modifier — Tailwind can't inject
 * an alpha channel into a plain var() reference, so it skips generating the
 * utility instead of erroring, and the class just does nothing.
 */
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', md: '1.5rem', xl: '2rem' }, screens: { '2xl': '1240px' } },
    extend: {
      colors: {
        brand: {
          DEFAULT: withOpacity('--vc-brand'),
          hover: withOpacity('--vc-brand-hover'),
          deep: withOpacity('--vc-brand-deep'),
          400: withOpacity('--vc-brand-400'),
          300: withOpacity('--vc-brand-300'),
          200: withOpacity('--vc-brand-200'),
          100: withOpacity('--vc-brand-100'),
        },
        ink: withOpacity('--vc-ink'),
        heading: withOpacity('--vc-heading'),
        muted: withOpacity('--vc-text-secondary'),
        subtle: withOpacity('--vc-text-tertiary'),
        placeholder: withOpacity('--vc-text-placeholder'),
        disabled: withOpacity('--vc-text-disabled'),
        surface: { DEFAULT: withOpacity('--vc-bg-0'), 1: withOpacity('--vc-bg-1'), 2: withOpacity('--vc-bg-2') },
        cream: { DEFAULT: withOpacity('--vc-cream'), 2: withOpacity('--vc-cream-2'), 3: withOpacity('--vc-cream-3') },
        line: { DEFAULT: withOpacity('--vc-border-1'), hover: withOpacity('--vc-border-hover'), strong: withOpacity('--vc-border-selected') },
        lemon: withOpacity('--vc-lemon'),
        star: withOpacity('--vc-star'),
        /* Packaging colours, lifted from the Vihaan pouches so the UI and the
           product photography agree: wine from Red Banana, gold from Nendran. */
        wine: { DEFAULT: withOpacity('--vc-wine'), 100: withOpacity('--vc-wine-100') },
        gold: { DEFAULT: withOpacity('--vc-gold'), 100: withOpacity('--vc-gold-100') },
        success: { bg: withOpacity('--vc-success-0'), line: withOpacity('--vc-success-1'), DEFAULT: withOpacity('--vc-success-2'), text: withOpacity('--vc-success-text') },
        warning: { bg: withOpacity('--vc-warning-0'), line: withOpacity('--vc-warning-1'), DEFAULT: withOpacity('--vc-warning-2') },
        danger: { bg: withOpacity('--vc-error-0'), line: withOpacity('--vc-error-1'), DEFAULT: withOpacity('--vc-error-2') },
        info: { bg: withOpacity('--vc-info-0'), line: withOpacity('--vc-info-1'), DEFAULT: withOpacity('--vc-info-2') },
      },
      fontFamily: {
        /* Baloo 2 for anything that should feel playful; Nunito Sans for reading. */
        display: ['Quicksand', 'Baloo 2', 'Trebuchet MS', 'system-ui', 'sans-serif'],
        sans: ['Nunito Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      /* Static weights now (the old 380/520/630 values were for a variable font
         and would round to the nearest available face anyway). */
      fontWeight: { reg: '400', med: '600', bold: '700', heavy: '800' },
      fontSize: {
        'caption-1': ['12px', { lineHeight: '1.4' }],
        'caption-2': ['14px', { lineHeight: '1.45' }],
        'body-1': ['16px', { lineHeight: '1.55' }],
        'body-2': ['17px', { lineHeight: '1.55' }],
        'body-3': ['18px', { lineHeight: '1.5' }],
        'body-4': ['20px', { lineHeight: '1.5' }],
        'title-1': ['21px', { lineHeight: '1.25' }],
        'title-2': ['24px', { lineHeight: '1.22' }],
        'title-3': ['28px', { lineHeight: '1.18' }],
        'title-4': ['34px', { lineHeight: '1.14' }],
        'title-5': ['42px', { lineHeight: '1.1' }],
        'title-6': ['56px', { lineHeight: '1.05' }],
      },
      /* Softer, rounder geometry throughout — the shape half of the clay look. */
      borderRadius: { btn: '14px', card: '18px', tile: '22px', section: '28px', blob: '42px', pill: '128px' },
      boxShadow: {
        1: 'var(--vc-elevation-1)',
        2: 'var(--vc-elevation-2)',
        3: 'var(--vc-elevation-3)',
        sheet: 'var(--vc-elevation-sheet)',
        'clay-sm': 'var(--vc-clay-sm)',
        'clay-md': 'var(--vc-clay-md)',
        'clay-lg': 'var(--vc-clay-lg)',
      },
      spacing: { 18: '4.5rem', 22: '5.5rem' },
      transitionTimingFunction: { standard: 'cubic-bezier(.2,0,0,1)', bouncy: 'cubic-bezier(.34,1.56,.64,1)' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        /* Two identical card sets sit side by side; shifting by half the track
           length lands set 2 exactly where set 1 began, so the loop is seamless. */
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fade-up .24s cubic-bezier(0,0,.2,1) both',
        'slide-in-right': 'slide-in-right .24s cubic-bezier(0,0,.2,1) both',
        'slide-in-left': 'slide-in-left .24s cubic-bezier(0,0,.2,1) both',
        'slide-in-up': 'slide-in-up .24s cubic-bezier(0,0,.2,1) both',
        shimmer: 'shimmer 1.4s linear infinite',
        float: 'float 4s ease-in-out infinite',
        marquee: 'marquee 60s linear infinite',
        /* Same keyframes, quicker — short text needs to move faster than wide cards to read as a ticker. */
        ticker: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
