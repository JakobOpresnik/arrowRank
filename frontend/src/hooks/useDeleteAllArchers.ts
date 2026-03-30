import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAllArchers } from '../api/archers';

export const useDeleteAllArchers = (competitionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteAllArchers(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
      queryClient.invalidateQueries({ queryKey: ['archers'] });
    },
  });
};
