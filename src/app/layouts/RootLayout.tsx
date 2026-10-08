import { Suspense, useLayoutEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { AnnouncementBar, BottomNav, ErrorBoundary, Footer, Header, MobileNav } from '@/components/layout';
import { CartDrawer } from '@/components/commerce';
import { PageSkeleton, Toaster } from '@/components/ui';

/**
 * The page scrolls smoothly for in-page anchors (see globals.css), but a route
 * change must land instantly — otherwise ScrollRestoration animates the reader
 * all the way up from the footer of the previous page.
 *
 * Marks the document for the single frame in which react-router restores
 * scroll. Rendered immediately before <ScrollRestoration /> so that its layout
 * effect runs first: React fires layout effects in tree order.
 */
const InstantRouteScroll = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.dataset.routing = '';
    const id = requestAnimationFrame(() => delete html.dataset.routing);
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
};

/** Shell for every page: skip link, announcement, header, page, footer, phone bottom nav, overlays. */
export const RootLayout = () => {
  const { pathname } = useLocation();
  const checkout = pathname.startsWith('/checkout');
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!checkout && <AnnouncementBar />}
      <Header />
      <main id="main" className="min-w-0 flex-1 pb-[var(--vc-bottom-nav-total)] md:pb-0" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      {!checkout && <Footer />}
      <BottomNav />
      <MobileNav />
      <CartDrawer />
      <Toaster />
      <InstantRouteScroll />
      <ScrollRestoration />
    </div>
  );
};
