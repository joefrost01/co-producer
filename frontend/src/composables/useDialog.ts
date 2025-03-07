import { ref, Ref } from 'vue';

export function useDialog<T = any>() {
  const isOpen = ref(false);
  const selectedItem = ref<T | null>(null);
  const isEditing = ref(false);

  function openAdd() {
    selectedItem.value = null;
    isEditing.value = false;
    isOpen.value = true;
  }

  function openEdit(item: T) {
    selectedItem.value = item;
    isEditing.value = true;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return {
    isOpen,
    selectedItem,
    isEditing,
    openAdd,
    openEdit,
    close
  };
}
