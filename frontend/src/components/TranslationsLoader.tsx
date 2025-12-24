import { CircularProgress, Stack, Typography } from '@mui/joy';
import { useTranslation } from 'react-i18next';

const TranslationsLoader = () => {
  const { t } = useTranslation();
  return (
    <Stack direction='column' alignItems='center' spacing={2}>
      <CircularProgress color='primary' />
      <Typography color='neutral'>{t('loadingTranslations')}</Typography>
    </Stack>
  );
};

export default TranslationsLoader;
