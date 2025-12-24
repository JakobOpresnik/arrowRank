import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadCompetitionLogo } from '../api/competitions';
import { Competition, CompetitionLogoUpload } from '../types';

export const useUploadCompetitionLogo = (competitionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<Competition, Error, CompetitionLogoUpload>({
    mutationFn: uploadCompetitionLogo,
    onSuccess: () => {
      if (competitionId) {
        queryClient.invalidateQueries({ queryKey: ['competitions'] });
      }
    },
  });
};
