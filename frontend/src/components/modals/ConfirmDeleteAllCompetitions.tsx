import { useState, useEffect } from 'react';
import {
  Button,
  Text,
  TextInput,
  Code,
  ThemeIcon,
  Group,
  Divider,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from './ModalWrapper';

const CONFIRM_WORD = 'DELETE EVERYTHING';

interface Props {
  open: boolean;
  hasArchers: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const ConfirmDeleteAllCompetitions = ({
  open,
  hasArchers,
  onClose,
  onDelete,
}: Props) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) setValue('');
  }, [open]);

  const confirmed = value.toUpperCase() === CONFIRM_WORD;

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
          {t('deleteAllCompetitionsDialogTitle')}
        </Group>
      }
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
      {hasArchers && (
        <Text fw={600} c='red' mb='xs'>
          {t('deleteAllCompetitionsArchersWarning')}
        </Text>
      )}
      <Text>{t('deleteAllCompetitionsDialogContent1')}</Text>
      <Text mt='xs'>{t('deleteAllCompetitionsDialogContent2')}</Text>
      <Divider my='md' />
      <Text size='sm' mb={4}>
        {t('deleteAllCompetitionsConfirmLabel')} <Code>{CONFIRM_WORD}</Code>
      </Text>
      <TextInput
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onPaste={(e) => e.preventDefault()}
        placeholder={CONFIRM_WORD}
        error={value.length > 0 && !confirmed}
      />
    </ModalWrapper>
  );
};

export default ConfirmDeleteAllCompetitions;
