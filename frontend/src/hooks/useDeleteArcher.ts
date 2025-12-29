import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteArcher } from '../api/archers';

export const useDeleteArcher = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { archerId: number }>({
    mutationFn: ({ archerId }) => deleteArcher(archerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
    },
  });
};
