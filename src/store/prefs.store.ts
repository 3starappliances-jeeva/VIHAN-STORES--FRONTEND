import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

export type Lang = 'en' | 'ta';

interface PrefsState {
  lang: Lang;
  pincode?: string;
  setLang: (l: Lang) => void;
  setPincode: (p?: string) => void;
}

/** Language continuity: the choice persists across pages, checkout and (on the backend) order messages. */
export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      lang: 'en',
      pincode: undefined,
      setLang: (lang) => {
        void i18n.changeLanguage(lang);
        document.documentElement.lang = lang;
        set({ lang });
      },
      setPincode: (pincode) => set({ pincode }),
    }),
    {
      name: 'vighan.prefs.v1',
      onRehydrateStorage: () => (state) => {
        if (state?.lang) {
          void i18n.changeLanguage(state.lang);
          document.documentElement.lang = state.lang;
        }
      },
    },
  ),
);
