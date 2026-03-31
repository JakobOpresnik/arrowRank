import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompetition } from '../api/competitions';
import { Competition, CompetitionCreate } from '../types';

export const useAddCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation<Competition, Error, CompetitionCreate>({
    mutationFn: createCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
};
