import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompetition } from '../api/competitions';
import { Competition, CompetitionCreate } from '../types';

export const useAddCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation<Competition, Error, CompetitionCreate>({
    mutationFn: createCompetition,
    onSuccess: (newCompetition) => {
      queryClient.setQueryData<Competition[]>(['competitions'], (old = []) => [
        ...old,
        newCompetition,
      ]);
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
};
