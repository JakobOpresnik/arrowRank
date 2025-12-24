import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteArcher } from '../api/archers';

export const useDeleteArcher = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (archerId: number) => deleteArcher(archerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
    },
  });
};
