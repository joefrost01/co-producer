import { ref } from 'vue';
import { useQuasar } from 'quasar';

export function useConfirmation<T>() {
  const $q = useQuasar();
  const confirmDialog = ref(false);
  const itemToConfirm = ref<T | null>(null);

  function confirm(item: T, title: string, message: string) {
    return new Promise<boolean>((resolve) => {
      $q.dialog({
        title,
        message,
        cancel: true,
        persistent: true
      }).onOk(() => {
        resolve(true);
      }).onCancel(() => {
        resolve(false);
      });
    });
  }

  return { confirmDialog, itemToConfirm, confirm };
}
