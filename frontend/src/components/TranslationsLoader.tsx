import { Loader, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const TranslationsLoader = () => {
  const { t } = useTranslation();
  return (
    <Stack align='center' gap='md'>
      <Loader color='blue' />
      <Text c='dimmed'>{t('loadingTranslations')}</Text>
    </Stack>
  );
};

export default TranslationsLoader;
