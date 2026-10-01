import { Center, Loader, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { MissingDataProps } from '../types';

const MissingDataWrapper = <T,>({
  data,
  isLoading,
  error,
  isTable,
  children,
}: MissingDataProps<T>) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Center py='md'>
        <Loader aria-label={t('loading')} />
      </Center>
    );
  }

  if (error) {
    return (
      <Text
        size='sm'
        c='#fff'
        bg='#E64040'
        p='xs'
        role='alert'
        style={{ borderRadius: 6 }}
      >
        {t('errorWithMessage', { message: error.message })}
      </Text>
    );
  }

  if (!data || (data.length === 0 && !isTable)) {
    return (
      <Center py='xl'>
        <Text c='dimmed'>{t('noDataAvailable')}</Text>
      </Center>
    );
  }

  return <>{children}</>;
};

export default MissingDataWrapper;
