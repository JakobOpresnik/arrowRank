import { useQuery } from '@tanstack/react-query';
import { fetchCompetitions } from '../api/competitions';
import { Competition } from '../types';

export const useCompetitions = () => {
  return useQuery<Competition[], Error>({
    queryKey: ['competitions'],
    queryFn: fetchCompetitions,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
