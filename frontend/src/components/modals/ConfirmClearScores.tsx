import { Button, Typography } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { ClearScoresDialogProps } from '../../types';
import { ModalWrapper } from './ModalWrapper';

const ConfirmClearScores = ({
  open,
  onClose,
  onClear,
}: ClearScoresDialogProps) => {
  const { t } = useTranslation();
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('clearScoresDialogTitle')}
      actions={
        <>
          <Button variant='outlined' sx={{ border: 2 }} onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button
            sx={{
              background: '#E64040',
            }}
            onClick={onClear}
          >
            {t('clearButton')}
          </Button>
        </>
      }
    >
      <Typography>{t('clearScoresDialogContent1')}</Typography>
      <Typography>{t('clearScoresDialogContent2')}</Typography>
    </ModalWrapper>
  );
};

export default ConfirmClearScores;
