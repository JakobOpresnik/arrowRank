import { Button, Text } from '@mantine/core';
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
          <Button variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button color='red' onClick={onClear}>
            {t('clearButton')}
          </Button>
        </>
      }
    >
      <Text>{t('clearScoresDialogContent1')}</Text>
      <Text>{t('clearScoresDialogContent2')}</Text>
    </ModalWrapper>
  );
};

export default ConfirmClearScores;
