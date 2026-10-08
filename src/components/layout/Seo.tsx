import { useEffect } from 'react';
import { site } from '@/config/site';

/** Sets document title + meta description per route (swap for react-helmet when SSR arrives). */
export const Seo = ({ title, description }: { title?: string; description?: string }) => {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : `${site.name} — ${site.tagline}`;
    if (description) {
      let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!m) {
        m = document.createElement('meta');
        m.name = 'description';
        document.head.appendChild(m);
      }
      m.content = description;
    }
  }, [title, description]);
  return null;
};
