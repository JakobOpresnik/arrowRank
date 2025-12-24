import { useState } from 'react';
import { type SnackbarOrigin, Snackbar, Typography } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import type { CompetitionState } from '../App';
import { keyframes } from '@mui/material/styles';

interface SnackBarProps extends SnackbarOrigin {
  title: string;
}

const SNACKBAR_DISPLAY_DURATION = 2500;

const SnackBar = ({
  open,
  competitionState,
  onClose,
}: {
  open: boolean;
  competitionState: CompetitionState;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<SnackBarProps>({
    title: '',
    vertical: 'bottom',
    horizontal: 'right',
  });
  const { vertical, horizontal } = state;

  const title: string =
    competitionState === 'created'
      ? t('competitionCreatedSuccessfully')
      : t('competitionUpdatedSuccessfully');

  const handleCloseSnackBar = (): void => {
    setState({ ...state, title: '' });
    onClose();
  };

  const slideInRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

  const slideOutRight = keyframes`
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

  const animationStyle: string = `${
    open ? slideInRight : slideOutRight
  } 0.3s ease forwards`;

  return (
    <Snackbar
      key={vertical + horizontal}
      anchorOrigin={{ vertical, horizontal }}
      color='success'
      variant='soft'
      open={open}
      onClose={handleCloseSnackBar}
      autoHideDuration={SNACKBAR_DISPLAY_DURATION}
      startDecorator={<CheckIcon color='success' />}
      sx={{
        animation: animationStyle,
      }}
    >
      <Typography color='success'>{title}</Typography>
    </Snackbar>
  );
};

export default SnackBar;
