import { ref } from 'vue';
import { useQuasar } from 'quasar';

export function useForm<T extends Object>(
  initialValues: T,
  saveFunction: (data: T) => Promise<any>,
  options = { resetAfterSave: true }
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
    } catch (error) {
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

  return {
    formData,
    loading,
    resetForm,
    handleSubmit
  };
}
