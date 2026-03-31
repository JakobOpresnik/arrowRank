import { useState, useEffect } from 'react';
import { Button, Text, TextInput, Code, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from './ModalWrapper';

interface Props {
  open: boolean;
  archerCount: number;
  competitionName: string;
  onClose: () => void;
  onDelete: () => void;
}

const ConfirmDeleteAllArchers = ({ open, archerCount, competitionName, onClose, onDelete }: Props) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) setValue('');
  }, [open]);

  const confirmed = value === competitionName;

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('deleteAllArchersDialogTitle')}
      padding='xl'
      footerMt='xl'
      actions={
        <>
          <Button variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button color='red' disabled={!confirmed} onClick={onDelete}>
            {t('deleteButton')}
          </Button>
        </>
      }
    >
      <Text>{t('deleteAllArchersDialogContent1', { count: archerCount })}</Text>
      <Text mt='xs'>{t('deleteAllArchersDialogContent2')}</Text>
      <Divider my='md' />
      <Text size='sm' mb={4}>{t('deleteAllArchersConfirmLabel')} <Code>{competitionName}</Code></Text>
      <TextInput
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onPaste={(e) => e.preventDefault()}
        placeholder={competitionName}
        error={value.length > 0 && !confirmed}
      />
    </ModalWrapper>
  );
};

export default ConfirmDeleteAllArchers;
