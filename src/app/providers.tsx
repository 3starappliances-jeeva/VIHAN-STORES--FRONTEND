import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/i18n';

/** App-wide providers. Query defaults: retry once, keep data 5 min, no refetch on focus (mobile data). */
export const AppProviders = ({ children }: { children: ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
