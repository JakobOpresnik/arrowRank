import { useTranslation } from 'react-i18next';
import { DeleteArcherProps } from '../../types';
import { Button, Typography } from '@mui/joy';
import { ModalWrapper } from './ModalWrapper';

const DeleteArcher = ({
  open,
  archerId,
  onClose,
  onDelete,
}: DeleteArcherProps) => {
  const { t } = useTranslation();

  const handleDelete = () => {
    onDelete(archerId);
    onClose();
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('deleteArcherDialogTitle')}
      actions={
        <>
          <Button variant='outlined' sx={{ border: 2 }} onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button
            sx={{
              background: '#E64040',
            }}
            onClick={handleDelete}
          >
            {t('tableDeleteButton')}
          </Button>
        </>
      }
    >
      <Typography>{t('deleteArcherDialogContent1')}</Typography>
      <Typography>{t('deleteArcherDialogContent2')}</Typography>
    </ModalWrapper>
  );
};

export default DeleteArcher;
