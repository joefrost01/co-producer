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

const app = createApp(App);

// Initialize Pinia and use it before mounting the app
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  config: {
    // Your custom Quasar config
  }
});

app.mount('#app');
