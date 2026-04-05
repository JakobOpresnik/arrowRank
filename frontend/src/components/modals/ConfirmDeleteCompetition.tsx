import { useState, useEffect, type FormEvent } from 'react';
import { Button, Text, TextInput, Code, ThemeIcon, Group, Divider } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from './ModalWrapper';

interface Props {
  open: boolean;
  competitionName: string;
  onClose: () => void;
  onDelete: () => void;
}

const ConfirmDeleteCompetition = ({ open, competitionName, onClose, onDelete }: Props) => {
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
      padding='xl'
      footerMt='xl'
      title={
        <Group gap='xs'>
          <ThemeIcon color='red' variant='light' size='md'>
            <IconAlertTriangle size={16} />
          </ThemeIcon>
          {t('deleteCompetitionDialogTitle')}
        </Group>
      }
      actions={
        <>
          <Button type='button' variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button type='submit' form='confirm-delete-competition' color='red' disabled={!confirmed}>
            {t('deleteButton')}
          </Button>
        </>
      }
    >
      <form id='confirm-delete-competition' onSubmit={handleSubmit}>
        <Text fw={600} mb='xs'>{competitionName}</Text>
        <Text>{t('deleteCompetitionDialogContent1')}</Text>
        <Text mt='xs'>{t('deleteCompetitionDialogContent2')}</Text>
        <Divider my='md' />
        <Text size='sm' mb={4}>
          {t('deleteCompetitionConfirmLabel')} <Code>{competitionName}</Code>
        </Text>
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

export default ConfirmDeleteCompetition;
