<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Filters</div>

      <slot name="filters"></slot>

      <div class="row justify-end">
        <q-btn flat color="grey" label="Reset" @click="$emit('reset')" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineEmits(['reset']);
</script>
