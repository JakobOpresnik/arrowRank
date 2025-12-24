import { useQuery } from '@tanstack/react-query';
import { fetchArchersFiltered } from '../api/archers';
import { Archer } from '../types';

export const useArchersFiltered = (
  competitionId: number,
  club: string,
  category: string,
  gender: string,
  ageGroup: string,
  sort: 'asc' | 'desc'
) => {
  return useQuery<Archer[], Error>({
    queryKey: [
      'archersFiltered',
      competitionId,
      club,
      category,
      gender,
      ageGroup,
      sort,
    ],
    queryFn: () =>
      fetchArchersFiltered(
        competitionId,
        club,
        category,
        gender,
        ageGroup,
        sort
      ),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
