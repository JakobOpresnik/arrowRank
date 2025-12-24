import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearArcherScores } from '../api/archers';

export const useArchersClearScores = (competitionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { competitionId: number }>({
    mutationFn: () => clearArcherScores(competitionId),
    onSuccess: () => {
      if (competitionId) {
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId],
        });
      }
    },
  });
};
