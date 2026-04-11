import { type FormEvent } from 'react';
import { Button, Text, ThemeIcon, Group } from '@mantine/core';
import { IconPower } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from './ModalWrapper';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmExit = ({ open, onClose, onConfirm }: Props) => {
  const { t } = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm();
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
            <IconPower size={16} />
          </ThemeIcon>
          {t('exitDialogTitle')}
        </Group>
      }
      actions={
        <>
          <Button type='button' variant='default' onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button type='submit' form='confirm-exit' color='red'>
            {t('exitButton')}
          </Button>
        </>
      }
    >
      <form id='confirm-exit' onSubmit={handleSubmit}>
        <Text>{t('exitDialogContent')}</Text>
      </form>
    </ModalWrapper>
  );
};

export default ConfirmExit;
