import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { categories } from '@/data/catalogue';
import { Seo, SearchBar } from '@/components/layout';
import { Button, EmptyState } from '@/components/ui';
import { CategoryTile } from '@/components/commerce';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="page py-10">
      <Seo title="Page not found" />
      <EmptyState icon={<Compass size={28} />} title={t('common.notFound')} description={t('common.notFoundSub')} action={<Button to="/">{t('nav.home')}</Button>} compact />
      <SearchBar className="mx-auto max-w-md" size="md" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.slice(0, 4).map((c) => (
          <CategoryTile key={c.slug} category={c} size="sm" />
        ))}
      </div>
    </div>
  );
};

export default NotFoundPage;
