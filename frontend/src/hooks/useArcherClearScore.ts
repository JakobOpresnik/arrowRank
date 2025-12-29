import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearArcherScore } from '../api/archers';

export const useArcherClearScore = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { archerId: number }>({
    mutationFn: ({ archerId }) => clearArcherScore(archerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['archersFiltered'],
      });
    },
  });
};
