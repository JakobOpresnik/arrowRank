import { SegmentedControl, Group, Text } from '@mantine/core';
import { SUPPORTED_LANGUAGES, LANGUAGE_FLAGS } from '../constants';
import { SelectLanguageProps, Language } from '../types';

const SelectLanguage = ({ language, setLanguage }: SelectLanguageProps) => {
  return (
    <SegmentedControl
      value={language}
      onChange={(value) => setLanguage(value as Language)}
      size='sm'
      data={SUPPORTED_LANGUAGES.map((lang) => ({
        value: lang,
        label: (
          <Group gap={6} wrap='nowrap'>
            <img
              src={LANGUAGE_FLAGS[lang as Language]}
              width={20}
              height={14}
              alt={lang}
              style={{ borderRadius: 2, objectFit: 'cover', display: 'block' }}
            />
            <Text size='xs' fw={600} style={{ lineHeight: 1 }}>
              {lang.toUpperCase()}
            </Text>
          </Group>
        ),
      }))}
    />
  );
};

export default SelectLanguage;
