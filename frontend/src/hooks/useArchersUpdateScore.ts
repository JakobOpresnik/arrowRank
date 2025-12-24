import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateArcherScore } from '../api/archers';
import { ArcherUpdate } from '../types';

export const useArchersUpdateScore = (competitionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ArcherUpdate>({
    mutationFn: updateArcherScore,
    onSuccess: () => {
      if (competitionId) {
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId],
        });
      }
    },
  });
};
