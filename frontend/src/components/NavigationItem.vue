<template>
  <q-item :to="to" exact clickable v-ripple>
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  to: string;
}>();
</script>
