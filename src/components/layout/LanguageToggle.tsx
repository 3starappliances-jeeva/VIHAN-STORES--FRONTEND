import { cn } from '@/lib/utils';
import { usePrefsStore, type Lang } from '@/store/prefs.store';

const langs: { id: Lang; label: string; full: string }[] = [
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'ta', label: 'தமிழ்', full: 'Tamil' },
];

/** Segmented control. The choice follows the customer through checkout and order messages. */
export const LanguageToggle = ({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'md' }) => {
  const lang = usePrefsStore((s) => s.lang);
  const setLang = usePrefsStore((s) => s.setLang);
  return (
    <div role="radiogroup" aria-label="Language" className={cn('inline-flex rounded-pill border border-line bg-surface p-0.5', className)}>
      {langs.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={lang === l.id}
          lang={l.id}
          title={l.full}
          onClick={() => setLang(l.id)}
          className={cn('rounded-pill px-3 font-med transition-colors', size === 'sm' ? 'h-8 text-caption-1' : 'h-10 text-caption-2', lang === l.id ? 'bg-ink text-white' : 'text-muted hover:text-ink')}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};
