<template>
  <q-card class="entity-card">
    <q-card-section>
      <slot name="header"></slot>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <slot name="content"></slot>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.entity-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
