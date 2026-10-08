import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui';
import { whatsappLink } from '@/config/site';

/** Router error element — shown for thrown responses (404 from loaders) and render crashes at route level. */
export const ErrorPage = () => {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const message = isRouteErrorResponse(error) ? error.statusText : error instanceof Error ? error.message : 'Unknown error';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="overline text-brand">{is404 ? '404' : 'Something went wrong'}</p>
      <h1 className="mt-2 text-title-3 font-med text-heading">{is404 ? 'We can’t find that page' : 'The page hit an error'}</h1>
      <p className="mt-2 max-w-md text-body-1 text-muted">{is404 ? 'The link may be old.' : `Reload to try again, or message us on WhatsApp if it keeps happening. (${message})`}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Link to="/" className="inline-flex h-12 items-center rounded-btn border border-ink px-5 font-med text-ink no-underline hover:bg-surface-1">
          Go to home
        </Link>
        <Button href={whatsappLink('Hi Vihaan, the website showed an error')} target="_blank" variant="ghost">
          WhatsApp us
        </Button>
      </div>
    </div>
  );
};
