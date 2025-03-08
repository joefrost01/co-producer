import { ref } from 'vue';
import { useQuasar } from 'quasar';

interface FormOptions {
  resetAfterSave: boolean;
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  saveFunction: (data: T) => Promise<unknown>,
  options: FormOptions = { resetAfterSave: true }
) {
  const $q = useQuasar();
  const formData = ref<T>({ ...initialValues });
  const loading = ref(false);

  const resetForm = () => {
    formData.value = { ...initialValues };
  };

  const handleSubmit = async () => {
    loading.value = true;
    try {
      await saveFunction(formData.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Successfully saved',
        icon: 'check'
      });

      if (options.resetAfterSave) {
        resetForm();
      }

      return true;
    } catch (_error) {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Failed to save',
        icon: 'report_problem'
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  return { formData, loading, handleSubmit };
}
