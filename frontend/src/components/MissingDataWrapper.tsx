import { Center, Loader, Text } from '@mantine/core';
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
      <Center py='md'>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Text size='sm' c='#fff' bg='#E64040' p='xs' style={{ borderRadius: 6 }}>
        Error: {error.message}
      </Text>
    );
  }

  if (!data || (data.length === 0 && !isTable)) {
    return (
      <Center py='xl'>
        <Text c='dimmed'>No data available.</Text>
      </Center>
    );
  }

  return <>{children}</>;
};

export default MissingDataWrapper;
