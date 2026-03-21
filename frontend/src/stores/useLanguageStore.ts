import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';
import { Language, SelectLanguageProps } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';

export type LanguageStore = SelectLanguageProps;

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang: Language) => {
        i18n.changeLanguage(lang); // switch i18next language
        set({ language: lang });
      },
    }),
    {
      name: 'language-store', // key in localStorage
    },
  ),
);
