import { useTranslation } from 'react-i18next';
import { DeleteArcherProps } from '../../types';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy';

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
    <Modal open={open} onClose={onClose}>
      <ModalDialog maxWidth={410}>
        <ModalClose variant='soft' />
        <DialogTitle>
          <Typography paddingBottom={2}>
            {t('deleteArcherDialogTitle')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>{t('deleteArcherDialogContent1')}</Typography>
          <Typography>{t('deleteArcherDialogContent2')}</Typography>
        </DialogContent>
        <DialogActions>
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
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteArcher;
