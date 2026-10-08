import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MessageCircle, Phone, ShieldCheck, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { faqs } from '@/data/catalogue';
import { site, whatsappLink } from '@/config/site';
import { toast } from '@/store/ui.store';
import { Seo } from '@/components/layout';
import { Accordion, Breadcrumb, Button, Input, Select, Textarea } from '@/components/ui';

const issueTypes = [
  { value: 'damaged', label: 'Pack arrived damaged' },
  { value: 'missing', label: 'Item missing from parcel' },
  { value: 'wrong', label: 'Wrong item or size' },
  { value: 'quality', label: 'Quality concern' },
  { value: 'delay', label: 'Delivery delayed' },
  { value: 'other', label: 'Something else' },
];

const HelpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelId, setCancelId] = useState('');
  const [issue, setIssue] = useState({ orderId: '', type: '', details: '' });
  const [sent, setSent] = useState(false);

  const report = (e: FormEvent) => {
    e.preventDefault();
    if (!issue.orderId || !issue.type) return;
    setSent(true);
    toast({ tone: 'success', title: 'Report received', description: 'We reply on WhatsApp within a few hours, 9 AM – 7 PM.' });
  };

  const groups = Array.from(new Set(faqs.map((f) => f.group)));

  return (
    <div className="page pb-10 pt-4">
      <Seo title={t('help.title')} />
      <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('help.title') }]} />
      <div className="mt-4 mb-8">
        <h1 className="text-title-3 font-med text-heading md:text-title-4">{t('help.title')}</h1>
        <p className="mt-1 max-w-2xl text-body-1 text-muted">{t('help.sub')}</p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* cancel */}
          <section className="card p-5" aria-labelledby="h-cancel">
            <h2 id="h-cancel" className="flex items-center gap-2 text-title-1 font-med text-heading"><XCircle size={20} className="text-brand" aria-hidden /> {t('help.cancelTitle')}</h2>
            <p className="mt-1 text-body-1 text-muted">{t('track.cancelOkSub')}</p>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start"
              onSubmit={(e) => {
                e.preventDefault();
                if (cancelId.trim()) navigate(`/track/${cancelId.trim().toUpperCase()}`);
              }}
            >
              <Input aria-label={t('track.orderNumber')} placeholder="ORD-26-01834" value={cancelId} onChange={(e) => setCancelId(e.target.value.toUpperCase())} className="flex-1" />
              <Button type="submit" variant="outline" disabled={!cancelId.trim()}>
                Find order
              </Button>
            </form>
          </section>

          {/* report */}
          <section className="card p-5" aria-labelledby="h-report">
            <h2 id="h-report" className="flex items-center gap-2 text-title-1 font-med text-heading"><ShieldCheck size={20} className="text-brand" aria-hidden /> {t('help.reportTitle')}</h2>
            <p className="mt-1 text-body-1 text-muted">Damaged, missing or wrong item? Tell us within 48 hours of delivery — we replace or refund, your choice.</p>
            {sent ? (
              <div className="mt-4 rounded-card bg-success-bg p-4 text-body-1 text-success-text" role="status">
                Thanks — your report for {issue.orderId} is with us. We’ll message {t('brand.name')} support on WhatsApp shortly.
              </div>
            ) : (
              <form onSubmit={report} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
                <Input label={t('track.orderNumber')} required placeholder="ORD-26-01834" value={issue.orderId} onChange={(e) => setIssue({ ...issue, orderId: e.target.value.toUpperCase() })} />
                <Select label="What went wrong?" required placeholder="Choose one" options={issueTypes} value={issue.type} onChange={(e) => setIssue({ ...issue, type: e.target.value })} />
                <Textarea label="Details" optional className="sm:col-span-2" placeholder="Which pack, what you noticed, and how you’d like it resolved" value={issue.details} onChange={(e) => setIssue({ ...issue, details: e.target.value })} />
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-card border border-dashed border-line-strong p-4 text-body-1 text-muted hover:border-ink">
                    <Camera size={20} aria-hidden />
                    <span>
                      <span className="block font-med text-ink">Add a photo</span>
                      <span className="text-caption-2">A picture of the pack and the batch number helps us fix it faster</span>
                    </span>
                    <input type="file" accept="image/*" className="sr-only" onChange={() => toast({ tone: 'info', title: 'Photo attached' })} />
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={!issue.orderId || !issue.type}>
                    Send report
                  </Button>
                </div>
              </form>
            )}
          </section>

          {/* faq */}
          <section id="faq" className="scroll-mt-24" aria-labelledby="h-faq">
            <h2 id="h-faq" className="text-title-2 font-med text-heading">{t('help.faq')}</h2>
            {groups.map((g) => (
              <div key={g} className="mt-5">
                <h3 className="overline mb-1 text-brand">{g}</h3>
                <Accordion items={faqs.filter((f) => f.group === g).map((f, i) => ({ id: `${g}-${i}`, title: f.q, content: <p>{f.a}</p> }))} />
              </div>
            ))}
          </section>
        </div>

        <aside id="contact" className="space-y-4 scroll-mt-24 lg:sticky lg:top-[calc(var(--vc-header-h)+16px)] lg:self-start">
          <section className="rounded-section bg-brand p-5 text-white">
            <h2 className="text-title-1 font-med text-white">Talk to a person</h2>
            <p className="mt-1 text-body-1 text-white/85">{site.supportHours}, in Tamil or English.</p>
            <Button href={whatsappLink()} target="_blank" variant="whatsapp" full className="mt-4" icon={<MessageCircle size={18} />}>
              {t('help.whatsapp')}
            </Button>
            <a href={`tel:${site.supportPhone.replace(/\s/g, '')}`} className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn border border-white/60 font-med text-white no-underline hover:bg-white/10">
              <Phone size={18} aria-hidden /> {site.supportPhone}
            </a>
          </section>
          <section className="card p-5 text-caption-2 text-muted">
            <p className="text-body-1 font-med text-ink">Policies</p>
            <ul className="mt-2 space-y-1.5">
              <li>Cancel free until “Preparing”.</li>
              <li>Damaged / wrong item: report within 48 h with a photo.</li>
              <li>Refunds: 5–7 working days to the original method.</li>
              <li>Food items cannot be returned once opened. [Edit to your policy]</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default HelpPage;
