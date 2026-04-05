import { useState, useEffect, type FormEvent } from 'react';
import { Button, Text, TextInput, Code, Divider, ThemeIcon, Group } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (confirmed) onDelete();
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={
        <Group gap='xs'>
          <ThemeIcon color='red' variant='light' size='md'>
            <IconAlertTriangle size={16} />
          </ThemeIcon>
          {t('deleteAllArchersDialogTitle')}
        </Group>
      }
      padding='xl'
      footerMt='xl'
      actions={
        <>
          <Button type='button' variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button type='submit' form='confirm-delete-all-archers' color='red' disabled={!confirmed}>
            {t('deleteButton')}
          </Button>
        </>
      }
    >
      <form id='confirm-delete-all-archers' onSubmit={handleSubmit}>
        <Text>{t('deleteAllArchersDialogContent1', { count: archerCount })}</Text>
        <Text mt='xs'>{t('deleteAllArchersDialogContent2')}</Text>
        <Divider my='md' />
        <Text size='sm' mb={4}>{t('deleteAllArchersConfirmLabel')} <Code>{competitionName}</Code></Text>
        <TextInput
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          error={value.length > 0 && !confirmed}
          data-autofocus
        />
      </form>
    </ModalWrapper>
  );
};

export default ConfirmDeleteAllArchers;
