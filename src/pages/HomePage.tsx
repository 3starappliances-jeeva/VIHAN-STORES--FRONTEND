import { useTranslation } from 'react-i18next';
import { site } from '@/config/site';
import { useProducts } from '@/hooks';
import { Seo } from '@/components/layout';
import { SectionTitle } from '@/components/ui';
import { ProductRail } from '@/components/commerce';
import {
  AgeGrid,
  ClaimTicker,
  PromiseStrip,
  CategoryGrid,
  CommunityBand,
  EditorialBand,
  FaqSection,
  Hero,
  KitsSection,
  StorySection,
  Testimonials,
} from '@/components/home';

/**
 * Landing page. The band order alternates surface → cream → tint so the page reads as
 * distinct sections on a phone, where everything is one column and only the background
 * separates one story from the next.
 */
const HomePage = () => {
  const { t } = useTranslation();
  const best = useProducts({ tags: ['bestseller'], featuredOnly: true, pageSize: 8 });
  const fresh = useProducts({ sort: 'newest', featuredOnly: true, pageSize: 8 });
  return (
    <>
      <Seo description={`${site.name}: ${site.tagline}. Single-ingredient banana, dates, ragi and millet powders for babies from 6+ months, made fresh in ${site.origin}.`} />
      <Hero />

      <ClaimTicker />

      <CategoryGrid />

      <section className="bg-cream section" aria-labelledby="best-title">
        <div className="page">
          <SectionTitle title={<span id="best-title">{t('home.bestsellers')}</span>} subtitle={t('home.bestsellersSub')} href="/shop?sort=popular" />
          <ProductRail products={best.data?.items ?? []} loading={best.isPending} label={t('home.bestsellers')} />
        </div>
      </section>

      <AgeGrid />
      <EditorialBand />

      <section className="page section" aria-labelledby="new-title">
        <SectionTitle title={<span id="new-title">{t('home.newThisWeek')}</span>} subtitle="Fresh from batch B-0921" href="/shop?sort=newest" />
        <ProductRail products={fresh.data?.items ?? []} loading={fresh.isPending} label={t('home.newThisWeek')} />
      </section>

      <Testimonials />

      <StorySection />
      <PromiseStrip />
      <KitsSection />
      <CommunityBand />
      <FaqSection />
    </>
  );
};

export default HomePage;
