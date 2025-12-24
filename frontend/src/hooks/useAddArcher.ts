import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createArcher } from '../api/archers';
import { ArcherCreate } from '../types';

export const useAddArcher = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ArcherCreate>({
    mutationFn: createArcher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archers'] });
    },
  });
};
