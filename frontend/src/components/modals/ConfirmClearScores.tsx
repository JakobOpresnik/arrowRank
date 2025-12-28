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
import { useTranslation } from 'react-i18next';
import { ClearScoresDialogProps } from '../../types';
import { ModalWrapper } from './ModalWrapper';

const ConfirmClearScores = ({
  open,
  onClose,
  onClear,
}: ClearScoresDialogProps) => {
  const { t } = useTranslation();
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('clearScoresDialogTitle')}
      actions={
        <>
          <Button variant='outlined' sx={{ border: 2 }} onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button
            sx={{
              background: '#E64040',
            }}
            onClick={onClear}
          >
            {t('clearButton')}
          </Button>
        </>
      }
    >
      <Typography>{t('clearScoresDialogContent1')}</Typography>
      <Typography>{t('clearScoresDialogContent2')}</Typography>
    </ModalWrapper>
  );

  /* return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog maxWidth={410}>
        <ModalClose variant='soft' />
        <DialogTitle>
          <Typography paddingBottom={2}>
            {t('clearScoresDialogTitle')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>{t('clearScoresDialogContent1')}</Typography>
          <Typography>{t('clearScoresDialogContent2')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' sx={{ border: 2 }} onClick={onClose}>
            {t('cancelButton')}
          </Button>
          <Button
            sx={{
              background: '#E64040',
            }}
            onClick={onClear}
          >
            {t('clearButton')}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  ); */
};

export default ConfirmClearScores;
