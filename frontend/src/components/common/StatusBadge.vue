<template>
  <q-badge
    :color="getStatusColor(status)"
    text-color="white"
  >
    {{ formatStatus(status) }}
  </q-badge>
</template>

<script setup lang="ts">
defineProps<{
  status: string;
}>();

function getStatusColor(status: string) {
  switch (status) {
    case 'NotStarted': return 'grey';
    case 'InProgress': return 'blue';
    case 'Mastered': return 'positive';
    default: return 'grey';
  }
}

function formatStatus(status: string) {
  switch (status) {
    case 'NotStarted': return 'Not Started';
    case 'InProgress': return 'In Progress';
    case 'Mastered': return 'Mastered';
    default: return status;
  }
}
</script>
