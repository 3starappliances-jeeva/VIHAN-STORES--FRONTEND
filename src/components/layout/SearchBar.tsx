import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatINR } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useDebounce, useSuggest } from '@/hooks';
import { ClayThumb } from '@/components/ui';

export interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onDone?: () => void;
  size?: 'sm' | 'md';
}

/** Search with a suggestions listbox (arrow keys, Enter, Escape). Submitting goes to /shop?search=… */
export const SearchBar = ({ className, autoFocus, onDone, size = 'sm' }: SearchBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(term, 200);
  const { data: suggestions = [], isFetching } = useSuggest(debounced);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setTerm('');
    onDone?.();
    navigate(path);
  };

  const submit = () => {
    const q = term.trim();
    if (!q) return;
    track('search', { term: q });
    go(`/shop?search=${encodeURIComponent(q)}`);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(suggestions.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) go(`/product/${suggestions[active].slug}`);
      else submit();
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const showList = open && term.trim().length >= 2;

  return (
    <div ref={rootRef} className={cn('relative', className)} role="search">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search products"
          autoFocus={autoFocus}
          placeholder={t('nav.search')}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          enterKeyHint="search"
          className={cn(
            'w-full rounded-pill border border-line bg-surface-1 pl-10 pr-10 text-body-1 text-ink placeholder:text-placeholder',
            'hover:border-line-hover focus:border-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-ink',
            size === 'sm' ? 'h-10' : 'h-12',
          )}
        />
        {term && (
          <button type="button" aria-label="Clear search" onClick={() => { setTerm(''); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
            <X size={16} aria-hidden />
          </button>
        )}
      </div>
      {showList && (
        <ul id={listId} role="listbox" aria-label="Suggestions" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-card border border-line bg-surface p-1.5 shadow-2">
          {suggestions.length === 0 && !isFetching && <li className="px-3 py-3 text-caption-2 text-muted">No matches — press Enter to search everything.</li>}
          {suggestions.map((p, i) => {
            const sku = p.skus.find((s) => s.id === p.defaultSku);
            return (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(`/product/${p.slug}`)}
                className={cn('flex cursor-pointer items-center gap-3 rounded-btn px-2 py-2', i === active && 'bg-brand-100')}
              >
                <ClayThumb image={p.image} glyph={p.glyph} tone={p.tone} className="h-10 w-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-1 font-med text-ink">{p.name}</span>
                  <span className="block truncate text-caption-2 text-muted">{p.benefit.split('|')[0].trim()}</span>
                </span>
                {sku && <span className="tabular text-caption-2 font-med text-ink">{formatINR(sku.price)}</span>}
              </li>
            );
          })}
          {term.trim() && (
            <li role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={submit} className="mt-1 cursor-pointer rounded-btn border-t border-line px-3 py-2.5 text-caption-2 font-med text-brand hover:bg-surface-1">
              See all results for “{term.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
