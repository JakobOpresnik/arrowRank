import { SegmentedControl, Group, Text, VisuallyHidden } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_FLAGS } from '../constants';
import { SelectLanguageProps, Language } from '../types';

// endonyms: each language is named in itself, so it stays recognisable in any UI language
const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  sl: 'Slovenščina',
  hr: 'Hrvatski',
  de: 'Deutsch',
  it: 'Italiano',
};

const SelectLanguage = ({ language, setLanguage }: SelectLanguageProps) => {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      aria-label={t('changeLanguageTooltip')}
      value={language}
      onChange={(value) => setLanguage(value as Language)}
      size='sm'
      data={SUPPORTED_LANGUAGES.map((lang) => ({
        value: lang,
        label: (
          <Group gap={6} wrap='nowrap' title={LANGUAGE_NAMES[lang as Language]}>
            <img
              src={LANGUAGE_FLAGS[lang as Language]}
              width={20}
              height={14}
              alt=''
              style={{ borderRadius: 2, objectFit: 'cover', display: 'block' }}
            />
            <Text size='xs' fw={600} style={{ lineHeight: 1 }} aria-hidden>
              {lang.toUpperCase()}
            </Text>
            <VisuallyHidden>{LANGUAGE_NAMES[lang as Language]}</VisuallyHidden>
          </Group>
        ),
      }))}
    />
  );
};

export default SelectLanguage;
