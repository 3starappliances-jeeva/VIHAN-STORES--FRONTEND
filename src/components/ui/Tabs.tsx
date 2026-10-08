import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  defaultId?: string;
  className?: string;
  /** underline (default) or pill style */
  variant?: 'underline' | 'pill';
}

/** WAI-ARIA tabs with roving tabindex and arrow-key navigation. */
export const Tabs = ({ items, defaultId, className, variant = 'underline' }: TabsProps) => {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    let next = index;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else return;
    e.preventDefault();
    setActive(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" className={cn('hide-scrollbar flex overflow-x-auto', variant === 'underline' ? 'gap-6 border-b border-line' : 'gap-2')}>
        {items.map((it, i) => {
          const selected = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => (refs.current[i] = el)}
              role="tab"
              id={`${base}-tab-${it.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${it.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(it.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'shrink-0 whitespace-nowrap font-med transition-colors',
                variant === 'underline'
                  ? cn('-mb-px border-b-2 py-3 text-body-1', selected ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink')
                  : cn('h-10 rounded-pill border px-4 text-caption-2', selected ? 'border-ink bg-brand-100 text-ink' : 'border-line text-muted hover:border-line-hover hover:text-ink'),
              )}
            >
              {it.label}
              {typeof it.count === 'number' && <span className="ml-1.5 text-caption-2 text-subtle">({it.count})</span>}
            </button>
          );
        })}
      </div>
      {items.map((it) => (
        <div key={it.id} role="tabpanel" id={`${base}-panel-${it.id}`} aria-labelledby={`${base}-tab-${it.id}`} hidden={it.id !== active} tabIndex={0} className="pt-5 focus:outline-none">
          {it.id === active && it.content}
        </div>
      ))}
    </div>
  );
};
