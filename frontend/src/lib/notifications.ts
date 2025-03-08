// src/lib/notifications.ts
import { useQuasar } from 'quasar';

export function useNotifications() {
  const $q = useQuasar();

  return {
    success(message: string) {
      $q.notify({
        color: 'positive',
        position: 'top',
        message,
        icon: 'check'
      });
    },
    error(message: string) {
      $q.notify({
        color: 'negative',
        position: 'top',
        message,
        icon: 'report_problem'
      });
    }
    // Additional notification methods
  }
}
