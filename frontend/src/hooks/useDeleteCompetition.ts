import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompetition } from '../api/competitions';

export const useDeleteCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (competitionId: number) => deleteCompetition(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
      queryClient.invalidateQueries({ queryKey: ['archers'] });
    },
  });
};
