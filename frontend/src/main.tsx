import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.ts';
import i18n, { initI18n, loadLocales } from './i18n/index';
import { I18nextProvider } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './constants.ts';
import type { Language } from './types.ts';
import { useLanguageStore } from './stores/useLanguageStore.ts';
import TranslationsLoader from './components/TranslationsLoader.tsx';

async function main() {
  const { language } = useLanguageStore.getState();

  await initI18n();

  if (language && language !== i18n.language) {
    await i18n.changeLanguage(language);
  }

  // preload all languages to make switching instant
  await Promise.all(
    SUPPORTED_LANGUAGES.map(async (lang: Language) => {
      if (!i18n.hasResourceBundle(lang, 'translation')) {
        const data = await loadLocales(lang);
        i18n.addResourceBundle(lang, 'translation', data, true, true);
      }
    })
  );

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={<TranslationsLoader />}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        </I18nextProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

main();
