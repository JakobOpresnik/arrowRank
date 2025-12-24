import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadArchers } from '../api/archers';
import { ArchersUploadProps } from '../types';

export const useArchersUpload = (competitionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ArchersUploadProps>({
    mutationFn: uploadArchers,
    onSuccess: () => {
      if (competitionId) {
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId],
        });
      }
    },
  });
};
