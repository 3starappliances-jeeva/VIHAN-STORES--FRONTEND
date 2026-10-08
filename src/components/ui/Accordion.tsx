import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** allow several open at once */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export const Accordion = ({ items, multiple = false, defaultOpen = [], className }: AccordionProps) => {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const base = useId();
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));
  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id}>
            <h3>
              <button
                type="button"
                id={`${base}-${it.id}-btn`}
                aria-expanded={isOpen}
                aria-controls={`${base}-${it.id}-panel`}
                onClick={() => toggle(it.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-body-1 font-med text-ink hover:text-brand"
              >
                <span>{it.title}</span>
                <ChevronDown size={18} className={cn('shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} aria-hidden />
              </button>
            </h3>
            <div id={`${base}-${it.id}-panel`} role="region" aria-labelledby={`${base}-${it.id}-btn`} hidden={!isOpen} className="pb-4 text-body-1 text-muted">
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
