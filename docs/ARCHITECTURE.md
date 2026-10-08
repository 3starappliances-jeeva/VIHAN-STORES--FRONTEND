# Architecture notes

## Layers

```
pages/            route screens — compose components, own page-level state
components/       ui (primitives) → layout (shell) → commerce (domain) → home (marketing sections)
hooks/            React Query hooks (server state) + generic UI hooks
store/            Zustand (client state: cart, auth, checkout draft, prefs, ui, guest-track)
services/         API adapters (mock ⇄ real, one file per domain)
lib/              pure helpers: money, validators, variants, schemas, analytics
styles/ + tailwind.config.ts   tokens → utilities
```

Rule of thumb: **screens never import `data/` directly** — they go through `services/` via `hooks/`, so the mock can be
replaced without touching UI. Money is never hand-typed: `computeTotals()` is the single source of truth and is unit-tested.

## State ownership

| State | Where | Persistence | Why |
| --- | --- | --- | --- |
| Cart lines, coupon, wallet toggle, payment, express | `cart.store` | localStorage | survives reloads; cleared on order |
| Token, customer, addresses, returnTo | `auth.store` | localStorage | OTP session |
| Checkout address / updates draft | `checkout.store` | sessionStorage | tab-scoped: a shared device never carries another person's address |
| Language, pincode | `prefs.store` | localStorage | continuity through checkout and order messages |
| Guest-verified orders | `track.store` | memory only | privacy — never in URL or storage |
| Drawers, toasts, announcement dismissed | `ui.store` | announcement only | ephemeral UI |
| Products, orders, serviceability, batch reports | React Query | cache | server state with retries and staleness |

## Journey rules encoded

- OTP-only identity; the login mobile is the identity, **updates mobile** and **recipient mobile** may differ.
- Language chosen anywhere persists into checkout and is sent with the order (`order.language`).
- Self-cancellation only while `status ∈ {placed, confirmed}`; afterwards the UI offers "report a problem".
- Guest tracking needs order number + updates mobile and shows delivery status only.
- COD adds a fee, disables wallet, and ships a day later; express is offered only when serviceable.
- Unavailable variant options are disabled with a reason, never hidden; out-of-stock offers "Notify me".

## Adding a product

Add an entry in `src/data/catalogue.ts` (or your API). `simple()` builds size-only products; multi-step products declare
`steps` and `skus` explicitly — the `VariantSelector` resolves availability from the sku matrix, no extra config.

## Adding a page

1. Create `src/pages/MyPage.tsx` with a default export.
2. Register it in `src/app/router.tsx` (`lazy(() => import('@/pages/MyPage'))`).
3. Add nav links in `Header.tsx` / `MobileNav.tsx` / `Footer.tsx` and strings in `i18n/locales/*.json`.

## Testing strategy

- Pure logic (`computeTotals`, validators, variant matrix) → unit tests.
- Components with behaviour (`ProductCard`) → Testing Library with a `MemoryRouter`.
- Full flow (home → product → cart → OTP → address → payment → confirmed → track) → Playwright script used in QA;
  see the screenshots shipped with the delivery.
