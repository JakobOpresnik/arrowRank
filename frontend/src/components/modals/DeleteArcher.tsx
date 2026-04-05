import { useTranslation } from 'react-i18next';
import { DeleteArcherProps, DeletionAction } from '../../types';
import { Button, Stack, Text, Radio, Paper, Group } from '@mantine/core';
import { ModalWrapper } from './ModalWrapper';
import { IconTrash, IconX } from '@tabler/icons-react';
import { useState, type FormEvent } from 'react';

const DeleteArcher = ({
  open,
  archerId,
  onClose,
  onDelete,
}: DeleteArcherProps) => {
  const { t } = useTranslation();

  const [selectedOption, setSelectedOption] = useState<DeletionAction | null>(
    null
  );

  const isDeletingArcher: boolean = selectedOption === 'delete-archer';
  const isClearingScore: boolean = selectedOption === 'clear-score';
  const canDeleteAnything: boolean = isDeletingArcher || isClearingScore;

  const close = (): void => {
    setSelectedOption(null);
    onClose();
  };

  const handleDelete = (): void => {
    onDelete(archerId, selectedOption!);
    close();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canDeleteAnything) handleDelete();
  };

  const ModalActions = (
    <>
      <Button type='button' variant='default' onClick={close}>
        {t('cancelButton')}
      </Button>
      <Button type='submit' form='delete-archer-form' color='red' disabled={!canDeleteAnything}>
        {t('tableDeleteButton')}
      </Button>
    </>
  );

  return (
    <ModalWrapper
      open={open}
      onClose={close}
      title={t('deleteArcherDialogTitle')}
      actions={ModalActions}
      maxWidth={400}
    >
      <form id='delete-archer-form' onSubmit={handleSubmit}>
        <Stack gap='md'>
          <Text size='sm' c='dimmed'>{t('chooseDeletionOption')}</Text>
          <Radio.Group
            value={selectedOption ?? ''}
            onChange={(value) =>
              setSelectedOption(value as DeletionAction)
            }
          >
            <Stack gap='xs'>
              <Paper
                withBorder
                p='sm'
                style={{
                  cursor: 'pointer',
                  borderColor: isDeletingArcher
                    ? 'var(--mantine-color-red-5)'
                    : undefined,
                  borderWidth: isDeletingArcher ? 2 : 1,
                }}
                onClick={() => setSelectedOption('delete-archer')}
              >
                <Group gap='sm'>
                  <IconTrash
                    size={18}
                    color={isDeletingArcher ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-gray-5)'}
                  />
                  <Radio
                    value='delete-archer'
                    label={t('deleteArcherOption')}
                    color='red'
                  />
                </Group>
              </Paper>

              <Paper
                withBorder
                p='sm'
                style={{
                  cursor: 'pointer',
                  borderColor: isClearingScore
                    ? 'var(--mantine-color-red-5)'
                    : undefined,
                  borderWidth: isClearingScore ? 2 : 1,
                }}
                onClick={() => setSelectedOption('clear-score')}
              >
                <Group gap='sm'>
                  <IconX
                    size={18}
                    color={isClearingScore ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-gray-5)'}
                  />
                  <Radio
                    value='clear-score'
                    label={t('deleteScoreOption')}
                    color='red'
                  />
                </Group>
              </Paper>
            </Stack>
          </Radio.Group>

          {(isDeletingArcher || isClearingScore) && (
            <Stack pl='xs' gap={2}>
              {isDeletingArcher && (
                <>
                  <Text size='sm'>{t('deleteArcherDialogContent1')}</Text>
                  <Text size='sm' c='dimmed'>{t('deleteArcherDialogContent3')}</Text>
                </>
              )}
              {isClearingScore && (
                <>
                  <Text size='sm'>{t('deleteArcherDialogContent2')}</Text>
                  <Text size='sm' c='dimmed'>{t('deleteArcherDialogContent3')}</Text>
                </>
              )}
            </Stack>
          )}
        </Stack>
      </form>
    </ModalWrapper>
  );
};

export default DeleteArcher;
