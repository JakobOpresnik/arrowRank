import { ModalWrapperProps, OnCloseReason } from '@/types';
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
} from '@mui/joy';

export const ModalWrapper = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 500,
  sx,
}: ModalWrapperProps) => {
  return (
    <Modal
      open={open}
      disableEscapeKeyDown
      onClose={(_, reason: OnCloseReason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
    >
      <ModalDialog
        maxWidth={maxWidth}
        layout='center'
        sx={{
          maxHeight: '90vh',
          overflow: 'auto',
          ...sx,
        }}
      >
        <ModalClose variant='soft' />
        {title && (
          <DialogTitle>
            <Typography paddingBottom={2}>{title}</Typography>
          </DialogTitle>
        )}
        <DialogContent
          sx={{
            overflowY: 'auto',
            paddingRight: 1,

            // Firefox
            scrollbarWidth: 'thin',
            scrollbarColor: '#b4c4d4 transparent',

            // Chrome, Edge, Safari
            '&::-webkit-scrollbar': {
              width: 12,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#b4c4d4',
              borderRadius: 8,
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
          }}
        >
          {children}
        </DialogContent>
        {actions && <DialogActions>{actions}</DialogActions>}
      </ModalDialog>
    </Modal>
  );
};
