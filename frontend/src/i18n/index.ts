import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';

// tell Vite to include all translation files
const translationFiles = import.meta.glob('../locales/*/translations.json');

// async backend (dynamic imports with vite)
export const loadLocales = async (lng: string) => {
  const importer = translationFiles[`../locales/${lng}/translations.json`];
  // console.log('Available translation files:', Object.keys(translationFiles));

  if (!importer) {
    throw new Error(`No translations found for language: ${lng}`);
  }
  // cast to promise returning a module with a `default` export
  const mod = (await importer()) as { default: Record<string, string> };

  // console.log('[i18n] mod.default:', mod?.default);
  return mod.default;
};

export const initI18n = async (): Promise<typeof i18n> => {
  const initialLng = DEFAULT_LANGUAGE;
  const resources = {
    [initialLng]: {
      translation: await loadLocales(initialLng),
    },
  };

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: DEFAULT_LANGUAGE, // default language
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES,
      interpolation: { escapeValue: false },
      resources,
    });

  // lazy-load other languages when needed
  i18n.on('languageChanged', async (lng: Language) => {
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      const data: Record<string, string> = await loadLocales(lng);
      i18n.addResourceBundle(lng, 'translation', data, true, true);
    }
  });

  return i18n;
};

export default i18n;
