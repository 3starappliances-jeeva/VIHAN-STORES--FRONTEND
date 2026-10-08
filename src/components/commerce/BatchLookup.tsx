import { useState, type FormEvent } from 'react';
import { BadgeCheck, FileSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate } from '@/lib/utils';
import { useBatchReport } from '@/hooks';
import { Button, Input } from '@/components/ui';

/** "Look up your batch report" — the trust feature from the journey (batch number printed on every pack). */
export const BatchLookup = ({ className, defaultId = '' }: { className?: string; defaultId?: string }) => {
  const { t } = useTranslation();
  const [id, setId] = useState(defaultId);
  const m = useBatchReport();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (id.trim()) m.mutate(id);
  };

  return (
    <section className={cn('rounded-section bg-cream p-5 sm:p-6', className)} aria-labelledby="batch-title">
      <div className="flex items-start gap-3">
        {/* The 40px badge + gap costs a seventh of a 320px screen, so it only
            appears once there is width to spare. */}
        <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white sm:grid" aria-hidden>
          <FileSearch size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="batch-title" className="text-title-1 font-med text-heading">{t('product.batchLookup')}</h2>
          <p className="mt-1 text-caption-2 text-muted">{t('product.batchHint')}</p>
          <form onSubmit={submit} className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-start" noValidate>
            <Input aria-label="Batch number" placeholder="B-0921" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} error={m.isError ? (m.error as Error).message : undefined} className="w-full sm:max-w-xs sm:flex-1" autoCapitalize="characters" />
            <Button type="submit" loading={m.isPending} disabled={!id.trim()} className="w-full sm:w-auto">
              {t('product.getReport')}
            </Button>
          </form>
          {m.data && (
            <div className="mt-4 rounded-card border border-success-line bg-surface p-4" role="status">
              <p className="flex items-center gap-2 text-body-1 font-med text-success-text">
                <BadgeCheck size={18} aria-hidden /> Batch {m.data.batchId} · {m.data.product}
              </p>
              {/* Three dates at 320px give each column ~65px, which wraps both the
                  label and the value. Two up, then three once there's room. */}
              <dl className="mt-3 grid grid-cols-2 gap-3 text-caption-2 sm:grid-cols-3">
                <div><dt className="text-muted">Milled</dt><dd className="font-med text-ink">{formatDate(m.data.milled)}</dd></div>
                <div><dt className="text-muted">Packed</dt><dd className="font-med text-ink">{formatDate(m.data.packed)}</dd></div>
                <div><dt className="text-muted">Best before</dt><dd className="font-med text-ink">{formatDate(m.data.bestBefore)}</dd></div>
              </dl>
              {/* Four columns can't compress below ~22rem without crushing the
                  figures, so the table scrolls inside its own box and the page
                  itself never scrolls sideways. */}
              <div className="hide-scrollbar mt-4 overflow-x-auto">
                <table className="w-full min-w-[22rem] text-caption-2">
                  <caption className="sr-only">Lab test results</caption>
                  <thead>
                    <tr className="border-b border-line text-left text-muted">
                      <th scope="col" className="py-1.5 font-med">Test</th>
                      <th scope="col" className="py-1.5 font-med">Result</th>
                      <th scope="col" className="py-1.5 font-med">Limit</th>
                      <th scope="col" className="py-1.5 text-right font-med">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.data.tests.map((r) => (
                      <tr key={r.name} className="border-b border-line last:border-0">
                        <td className="py-1.5 text-ink">{r.name}</td>
                        <td className="tabular py-1.5 text-ink">{r.result}</td>
                        <td className="tabular py-1.5 text-muted">{r.limit}</td>
                        <td className="py-1.5 text-right font-med text-success-text">{r.pass ? 'Pass' : 'Fail'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-caption-1 text-subtle">Bracketed values are placeholders — connect your lab’s report feed to show real results.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
