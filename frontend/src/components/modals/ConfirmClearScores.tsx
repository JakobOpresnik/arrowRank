import { type FormEvent } from 'react';
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onClear();
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('clearScoresDialogTitle')}
      padding='xl'
      footerMt='xl'
      actions={
        <>
          <Button type='button' variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button type='submit' form='confirm-clear-scores' color='red'>
            {t('clearButton')}
          </Button>
        </>
      }
    >
      <form id='confirm-clear-scores' onSubmit={handleSubmit}>
        <Text>{t('clearScoresDialogContent1')}</Text>
        <Text>{t('clearScoresDialogContent2')}</Text>
      </form>
    </ModalWrapper>
  );
};

export default ConfirmClearScores;
