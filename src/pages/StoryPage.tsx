import { useTranslation } from 'react-i18next';
import { site } from '@/config/site';
import { Seo } from '@/components/layout';
import { Breadcrumb, Button, SectionTitle } from '@/components/ui';
import { StorySection, Benefits, HelpBand } from '@/components/home';

const StoryPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('nav.story')} description={`How ${site.name} sources, sprouts, stone-grinds and packs every batch.`} />
      <div className="page pt-4">
        <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.story') }]} />
      </div>
      <section className="page grid gap-8 py-8 md:grid-cols-2 md:items-center md:py-14">
        <div>
          <SectionTitle overline={site.origin} title="Food the way our grandmothers made it — with a batch number on it" size="lg" className="mb-4" as="h1" />
          <div className="prose-vc text-body-2 text-muted">
            <p>[Founder story — two or three short paragraphs in your own words: why you started, who grows for you, what you refuse to add.]</p>
            <p>[Keep it honest and specific: names of villages, the size of a batch, the day of the week you pack.]</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Button to="/shop" className="clay-press rounded-pill shadow-clay-sm">{t('nav.shopAll')}</Button>
            <Button to="/product/red-banana-powder#batch" variant="outline" className="rounded-pill">
              {t('product.batchLookup')}
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-section shadow-clay-md">
          <img
            src="/images/vihaan-red-banana-feature.jpeg"
            alt="Vihaan Red Banana Powder — 100% natural, no preservatives, safe for babies from 6 months"
            className="aspect-square w-full object-cover"
            width={1240}
            height={1240}
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>
      <StorySection />
      <Benefits />
      <HelpBand />
    </>
  );
};

export default StoryPage;
