import { useQuery } from '@tanstack/react-query';
import { fetchArchers } from '../api/archers';
import { Archer } from '../types';

export const useArchers = (
  competitionId: number /* excludeScores?: boolean */
) => {
  return useQuery<Archer[], Error>({
    queryKey: ['archers', competitionId],
    queryFn: () => fetchArchers(competitionId),
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 1, // retry once on failure
  });
};
