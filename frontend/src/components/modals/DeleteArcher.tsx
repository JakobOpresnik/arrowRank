import { useTranslation } from 'react-i18next';
import { DeleteArcherProps, DeletionAction } from '../../types';
import {
  Button,
  List,
  ListItem,
  ListItemDecorator,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/joy';
import { ModalWrapper } from './ModalWrapper';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

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

  const ModalActions = (
    <>
      <Button variant='outlined' sx={{ border: 2 }} onClick={close}>
        {t('cancelButton')}
      </Button>
      <Button
        sx={{
          background: '#E64040',
          ':hover': { background: '#E64040' },
        }}
        onClick={handleDelete}
        disabled={!canDeleteAnything}
      >
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
      sx={{ width: 450 }}
    >
      <Stack direction='column' gap={2}>
        <Stack direction='column' gap={0.5}>
          <Typography>{t('chooseDeletionOption')}</Typography>
          <RadioGroup aria-label='Delete Options'>
            <List
              sx={{
                minWidth: 240,
                '--List-gap': '0.5rem',
                '--ListItem-paddingY': '1rem',
                '--ListItem-radius': '8px',
                '--ListItemDecorator-size': '32px',
              }}
            >
              <ListItem
                variant='outlined'
                sx={{ boxShadow: 'sm', marginBottom: 0.5 }}
              >
                <ListItemDecorator>
                  <DeleteIcon
                    sx={{ color: isDeletingArcher ? '#E64040' : 'inherit' }}
                  />
                </ListItemDecorator>
                <Radio
                  overlay
                  color={isDeletingArcher ? 'danger' : 'neutral'}
                  label={t('deleteArcherOption')}
                  value='delete-archer'
                  onChange={() => setSelectedOption('delete-archer')}
                  sx={{
                    flexGrow: 1,
                    flexDirection: 'row-reverse',
                    color: isDeletingArcher ? '#E64040' : 'inherit',
                  }}
                  slotProps={{
                    action: ({ checked }) => ({
                      sx: (_theme) => ({
                        ...(checked && {
                          inset: -1,
                          border: '3px solid',
                          borderColor: '#E64040',
                        }),
                      }),
                    }),
                  }}
                />
              </ListItem>

              <ListItem variant='outlined' sx={{ boxShadow: 'sm' }}>
                <ListItemDecorator>
                  <ClearIcon
                    sx={{ color: isClearingScore ? '#E64040' : 'inherit' }}
                  />
                </ListItemDecorator>
                <Radio
                  overlay
                  color={isClearingScore ? 'danger' : 'neutral'}
                  label={t('deleteScoreOption')}
                  value='clear-score'
                  onChange={() => setSelectedOption('clear-score')}
                  sx={{
                    flexGrow: 1,
                    flexDirection: 'row-reverse',
                    color: isClearingScore ? '#E64040' : 'inherit',
                  }}
                  slotProps={{
                    action: ({ checked }) => ({
                      sx: (_theme) => ({
                        ...(checked && {
                          inset: -1,
                          border: '3px solid',
                          borderColor: '#E64040',
                        }),
                      }),
                    }),
                  }}
                />
              </ListItem>
            </List>
          </RadioGroup>
        </Stack>
        <Stack pl={1} mb={1}>
          {isDeletingArcher && (
            <>
              <Typography>{t('deleteArcherDialogContent1')}</Typography>
              <Typography>{t('deleteArcherDialogContent3')}</Typography>
            </>
          )}
          {isClearingScore && (
            <>
              <Typography>{t('deleteArcherDialogContent2')}</Typography>
              <Typography>{t('deleteArcherDialogContent3')}</Typography>
            </>
          )}
        </Stack>
      </Stack>
    </ModalWrapper>
  );
};

export default DeleteArcher;
