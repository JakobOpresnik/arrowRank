import { useQuery } from '@tanstack/react-query';
import { fetchArcher } from '../api/archers';
import { Archer } from '../types';

export const useArcher = (competitionId: number, archerId: number | null) => {
  return useQuery<Archer, Error>({
    queryKey: ['archer', competitionId, archerId],
    queryFn: () => fetchArcher(competitionId, archerId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
