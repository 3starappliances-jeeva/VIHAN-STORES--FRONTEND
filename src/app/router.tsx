import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { RequireAuth } from './guards/RequireAuth';
import { ErrorPage } from '@/pages/ErrorPage';

// Route-level code splitting: each page is its own chunk.
const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AddressPage = lazy(() => import('@/pages/checkout/AddressPage'));
const PaymentPage = lazy(() => import('@/pages/checkout/PaymentPage'));
const ConfirmedPage = lazy(() => import('@/pages/checkout/ConfirmedPage'));
const TrackPage = lazy(() => import('@/pages/TrackPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const StoryPage = lazy(() => import('@/pages/StoryPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:category', element: <ShopPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'track', element: <TrackPage /> },
      { path: 'track/:id', element: <TrackPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'story', element: <StoryPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', element: <AddressPage /> },
          { path: 'checkout/address', element: <AddressPage /> },
          { path: 'checkout/payment', element: <PaymentPage /> },
          { path: 'checkout/confirmed/:id', element: <ConfirmedPage /> },
          { path: 'account', element: <AccountPage /> },
          { path: 'account/:section', element: <AccountPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], { future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true } });
