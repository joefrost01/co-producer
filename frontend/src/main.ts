// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Import Quasar
import { Quasar } from 'quasar';
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
// Import Quasar css
import 'quasar/dist/quasar.css';

// Create the app instance
const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
app.use(pinia);

// Set up router
app.use(router);

// Set up Quasar
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  config: {
    // Your custom Quasar config
  }
});

// Mount the app
app.mount('#app');
