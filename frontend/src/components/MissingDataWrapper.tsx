import { Box, CircularProgress, Typography } from '@mui/joy';
import { MissingDataProps } from '../types';

const MissingDataWrapper = <T,>({
  data,
  isLoading,
  error,
  isTable,
  children,
}: MissingDataProps<T>) => {
  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' py={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography
        level='body-sm'
        sx={{
          background: '#E64040',
        }}
      >
        Error: {error.message}
      </Typography>
    );
  }

  if (!data || (data.length === 0 && !isTable)) {
    return (
      <Box display='flex' justifyContent='center' py={6}>
        <Typography color='neutral'>No data available.</Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default MissingDataWrapper;
