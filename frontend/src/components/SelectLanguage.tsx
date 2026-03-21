import { Select, Tooltip, Avatar, Group, Text } from '@mantine/core';
import { t } from 'i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_FLAGS } from '../constants';
import { SelectLanguageProps, Language } from '../types';
import type { ReactNode } from 'react';

const SelectLanguage = ({ language, setLanguage }: SelectLanguageProps) => {
  const data = SUPPORTED_LANGUAGES.map((lang: string) => ({
    value: lang,
    label: lang.toUpperCase(),
  }));

  const renderOption = ({
    option,
  }: {
    option: { value: string; label: string };
  }): ReactNode => (
    <Group gap='xs'>
      <Avatar
        src={LANGUAGE_FLAGS[option.value as Language]}
        alt={`${option.value} flag`}
        size={20}
        radius='xl'
      />
      <Text size='sm'>{option.label}</Text>
    </Group>
  );

  return (
    <Tooltip label={t('changeLanguageTooltip')} position='top'>
      <Select
        name='language'
        size='sm'
        data={data}
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        renderOption={renderOption}
        leftSection={
          <Avatar
            src={LANGUAGE_FLAGS[language]}
            alt={`${language} flag`}
            size={20}
            radius='xl'
          />
        }
        w={100}
        styles={{
          input: { backgroundColor: 'var(--mantine-color-brand-8)', color: '#f0f0f0', borderColor: 'var(--mantine-color-brand-7)' },
        }}
      />
    </Tooltip>
  );
};

export default SelectLanguage;
