import { Truck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/store/ui.store';

/** Brand-green strip (#2F815C, AA with white) — dismissal persists per device. */
export const AnnouncementBar = () => {
  const { t } = useTranslation();
  const dismissed = useUiStore((s) => s.announcementDismissed);
  const dismiss = useUiStore((s) => s.dismissAnnouncement);
  if (dismissed) return null;
  return (
    <div className="relative bg-brand text-white" role="region" aria-label="Announcement">
      <div className="page flex h-[var(--vc-announcement-h)] items-center justify-center gap-2 pr-10 text-caption-2 font-med">
        <Truck size={16} className="hidden shrink-0 sm:block" aria-hidden />
        <p className="truncate text-center">{t('announcement')}</p>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-btn text-white/90 hover:bg-white/15 hover:text-white">
        <X size={16} aria-hidden />
      </button>
    </div>
  );
};
