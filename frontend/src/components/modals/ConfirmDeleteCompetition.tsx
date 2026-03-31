import { Button, Text, ThemeIcon, Group } from '@mantine/core';
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
          <Button variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button color='red' onClick={onDelete}>
            {t('deleteButton')}
          </Button>
        </>
      }
    >
      <Text fw={600} mb='xs'>{competitionName}</Text>
      <Text>{t('deleteCompetitionDialogContent1')}</Text>
      <Text mt='xs'>{t('deleteCompetitionDialogContent2')}</Text>
    </ModalWrapper>
  );
};

export default ConfirmDeleteCompetition;
