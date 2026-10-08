# Vighan Natural Care — Customer Storefront

Production-grade React storefront for **Vighan Natural Care** (small-batch traditional foods, Tamil Nadu), built on the
**DESIGN-SYSTEM-JEEVA** tokens captured from the reference site: MiSans typography (380 / 520 / 630), sea-green `#2F815C`,
cream media surfaces, 4-step variant picker, "packed this week · batch" trust pattern.

Complete customer journey, mobile-first and WCAG 2.2 AA-minded:

| Step | Route | What it does |
| --- | --- | --- |
| Home | `/` | Photo-led hero, trust strip, categories, bestsellers rail, "how we make it", batch spotlight, kits, new this week, reviews, benefits, recipes, WhatsApp help band |
| Shop | `/shop`, `/shop/:category`, `/shop?search=…&sort=…&tags=…` | URL-synced filters + sort, load more, skeletons, empty and error states |
| Product | `/product/:slug` | Gallery, 4-step variant selector (unavailable options stay visible with a reason), qty, add / buy now, pincode delivery check, tabs, kit contents, nutrition placeholders, batch-report lookup, reviews, Q&A, related rail, sticky mobile add-to-cart bar |
| Cart | `/cart` (+ slide-over mini cart) | Qty stepper, save for later, remove with undo, coupons (`FIRST10`, `FAMILY5`), free-shipping meter, price details |
| Login | `/login` | OTP-only identity (demo code **123456**), resend countdown, WhatsApp opt-in, guest path |
| Checkout — address | `/checkout/address` | Saved addresses, react-hook-form + zod form, live pincode serviceability, Standard / Express, order-updates number (can differ from login number) and language |
| Checkout — payment | `/checkout/payment` | UPI / card / net banking / COD, wallet toggle, simulated gateway, 2 % cashback |
| Confirmed | `/checkout/confirmed/:id` | Order number, what-happens-next, summary, invoice / track actions |
| Track | `/track`, `/track/:id` | Guest tracking (order no. + updates mobile, status-only privacy), timeline, self-cancel **only before "Preparing"**, demo "advance status" |
| Account | `/account`, `/account/{addresses,wallet,profile}` | Orders + reorder, addresses, wallet history, profile & language |
| Help | `/help` | Cancel, report a problem (photo placeholder), FAQ accordion, WhatsApp / phone |
| Story, 404, error | `/story`, `*` | Brand story, not-found with search, route error page |

Demo data: 12 products, 8 categories, mock serviceability (Chennai `600xxx` = 2–3 days + express + COD; `19xxxx` / `79xxxx` = not
serviceable), mock batch reports `B-0921`, `B-0917`, `B-0912`. Orders persist in `localStorage` so the flow survives reloads.

---

## Quick start

```bash
npm install          # Node 18+ (tested on Node 22)
npm run dev          # http://localhost:5173
npm run build        # type-check + production bundle in dist/
npm run preview      # serve dist/ locally
npm test             # vitest (24 unit + component tests)
npm run lint         # eslint (flat config)
npm run typecheck    # tsc --noEmit
```

Copy `.env.example` to `.env` to change the shop name, WhatsApp number, FSSAI licence, shipping threshold, COD fee or API base URL.

## Folder map

```
├── index.html                 # font preloads, theme-color, manifest
├── public/
│   ├── fonts/                 # MiSansLatin Medium / Semibold / Bold (woff2)
│   ├── images/                # 18 product & story photos (Unsplash licence)
│   ├── favicon.svg · manifest.webmanifest
├── src/
│   ├── main.tsx · App.tsx     # entry, providers + router
│   ├── app/
│   │   ├── router.tsx         # createBrowserRouter, lazy routes, error element
│   │   ├── providers.tsx      # React Query client, i18n bootstrap
│   │   ├── layouts/RootLayout.tsx  # skip link, announcement, header, footer, bottom nav, overlays
│   │   └── guards/RequireAuth.tsx  # protects checkout + account, remembers returnTo
│   ├── styles/
│   │   ├── tokens.css         # primitive → semantic tokens (--vc-*), from the reference capture
│   │   └── globals.css        # @font-face, Tailwind layers, base + component classes
│   ├── config/site.ts         # everything a shop owner edits (name, numbers, fees, flags)
│   ├── types/index.ts         # Product, Sku, Cart, Order, Address, Customer, Serviceability…
│   ├── data/catalogue.ts      # demo catalogue, FAQs, recipes (replace with API)
│   ├── services/              # API layer — mock adapters gated by VITE_USE_MOCK_API
│   │   ├── api.ts             # products, categories, suggest, serviceability, batch reports
│   │   ├── auth.api.ts        # OTP send / verify
│   │   └── orders.api.ts      # place, list, get, track (guest), cancel, advance (demo)
│   ├── store/                 # Zustand
│   │   ├── cart.store.ts      # lines, coupons, wallet, payment, express + computeTotals()
│   │   ├── auth.store.ts      # token, customer, addresses, returnTo
│   │   ├── checkout.store.ts  # address / updates draft (sessionStorage)
│   │   ├── prefs.store.ts     # language + pincode continuity
│   │   ├── track.store.ts     # guest-verified orders (memory only — privacy)
│   │   └── ui.store.ts        # drawers, search, announcement, toasts
│   ├── hooks/                 # React Query hooks + useDebounce / useMediaQuery / useCountdown / useFocusTrap…
│   ├── i18n/                  # i18next, en.json + ta.json (full Tamil)
│   ├── lib/                   # utils (INR format, validators), analytics façade, variants, zod schemas
│   ├── components/
│   │   ├── ui/                # Button, IconButton, Badge/StatusBadge, Chip, Input/Textarea/Select/Checkbox/Switch/RadioCard,
│   │   │                      # QuantityStepper, Rating, PriceBlock, Skeleton, Modal, Drawer, Tabs, Accordion, Toaster,
│   │   │                      # EmptyState/NoResults/ErrorState, SectionTitle, Breadcrumb, Alert, ProgressBar
│   │   ├── layout/            # Logo, AnnouncementBar, Header (+ mega menu), MobileNav, SearchBar (suggestions),
│   │   │                      # LanguageToggle, BottomNav, Footer, Seo, ErrorBoundary
│   │   ├── commerce/          # ProductCard, ProductGrid/Rail, CategoryTile, TrustStrip, FreeShippingMeter, CartLineItem,
│   │   │                      # CartDrawer, OrderSummary, VariantSelector, PincodeCheck, BatchLookup, ReviewSummary/ReviewCard,
│   │   │                      # QABlock, OrderTimeline, AddressCard/AddressForm, StepHeader, PaymentMethodList
│   │   └── home/              # Hero, CategoryGrid, StorySection, BatchSpotlight, KitsSection, Testimonials, Benefits, Recipes, HelpBand
│   ├── pages/                 # one file per route (lazy-loaded), checkout/ sub-folder
│   └── test/setup.ts          # jest-dom, jsdom polyfills
├── tailwind.config.ts         # theme bound to CSS variables (bg-brand, text-ink, rounded-card, shadow-1, text-title-3 …)
├── vite.config.ts             # alias @ → src, manual chunks, vitest config
├── Dockerfile · nginx.conf    # static build behind nginx with SPA fallback + caching
└── .github/workflows/ci.yml   # install → lint → typecheck → test → build
```

## Design-system wiring

- **Tokens**: `src/styles/tokens.css` holds every colour, radius, shadow and layout size as `--vc-*` variables.
  `tailwind.config.ts` maps them to utilities, so `bg-brand`, `text-muted`, `rounded-card`, `shadow-2`, `text-title-3`
  all resolve to variables — change a token once and every screen follows.
- **Type scale**: `caption-1/2`, `body-1…4`, `title-1…6` with weights `font-reg` (380) `font-med` (520) `font-bold` (630),
  exactly the reference's MiSans axis.
- **Accessibility**: skip link, focus-visible outlines, ARIA tabs / dialogs / comboboxes / radiogroups, focus trapping in
  drawers and modals, live regions for toasts and errors, colour substitutions for AA (`--vc-brand-hover`, `--vc-success-text`),
  44 px touch targets on phones, reduced-motion respected.
- **`cn()`** (clsx + tailwind-merge) is configured with the custom scales so `text-body-1` never clobbers `text-white`.

## Swapping the mock API for a real backend

1. Set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=https://api.yourdomain.com`.
2. Each function in `src/services/*.ts` already has the real `http()` call next to its mock — keep the return shapes
   (`Paged<Product>`, `Order`, `Serviceability`, …) or adapt them in one place.
3. Payments: replace `simulateGateway()` in `src/pages/checkout/PaymentPage.tsx` with your gateway SDK (Razorpay / PhonePe),
   then POST the reference to `/orders`.
4. Analytics: subscribe to events in `src/lib/analytics.ts` (`onTrack`) — GA4 / Meta Pixel / warehouse.
5. Content marked `[in brackets]` (reviews, lab values, FSSAI, contact) is a placeholder — never ship invented claims.

## Deployment

**Static host** (Vercel / Netlify / S3 + CloudFront): deploy `dist/` with an SPA rewrite (`/* → /index.html`).

**Docker**

```bash
docker build -t vighan-storefront .
docker run -p 8080:80 vighan-storefront
```

`nginx.conf` serves `dist/` with long-cache immutable assets, no-cache `index.html`, gzip, and the SPA fallback.

## Quality gates

- `npm run typecheck` — strict TS, `noUnusedLocals`, `noUnusedParameters`
- `npm run lint` — ESLint 9 flat config, react-hooks, react-refresh
- `npm test` — Vitest + Testing Library (`cart.store`, `utils`, `variants`, `ProductCard`)
- CI runs all four on every push / PR (`.github/workflows/ci.yml`)

## Licences & credits

Photos from Unsplash (free licence, attribution appreciated). MiSans font © Xiaomi, free for commercial use.
Design tokens documented in the DESIGN-SYSTEM-JEEVA project (`deliverables/07-reference-token-capture.md`).
