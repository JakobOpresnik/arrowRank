import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAllCompetitions } from '../api/competitions';

export const useDeleteAllCompetitions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteAllCompetitions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
      queryClient.invalidateQueries({ queryKey: ['archers'] });
    },
  });
};
