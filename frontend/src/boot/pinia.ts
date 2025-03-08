// src/boot/pinia.ts
import { createPinia } from 'pinia';
import type { App } from 'vue';

export default (app: App): void => {
  const pinia = createPinia();
  app.use(pinia);
};
