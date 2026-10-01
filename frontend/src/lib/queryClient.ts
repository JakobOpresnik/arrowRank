import { MutationCache, QueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import i18n from '../i18n';

export const queryClient = new QueryClient({
  // every failed mutation surfaces as a notification instead of failing silently
  mutationCache: new MutationCache({
    onError: (error: Error) => {
      console.error(error);
      notifications.show({
        title: i18n.t('errorTitle'),
        message: error.message,
        color: 'red',
        autoClose: 6000,
      });
    },
  }),
});
