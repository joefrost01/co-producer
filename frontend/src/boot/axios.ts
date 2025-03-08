// src/boot/axios.ts
import axios from 'axios';
import type { App } from 'vue';
import { Notify } from 'quasar';

// Create a base instance with default settings
const api = axios.create({
  baseURL: '/api'
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling
    if (error.response) {
      const status = error.response.status;
      // Handle specific status codes
      if (status === 401) {
        Notify.create({
          type: 'negative',
          message: 'Authentication required',
          position: 'top'
        });
      } else if (status === 500) {
        Notify.create({
          type: 'negative',
          message: 'Server error occurred',
          position: 'top'
        });
      }
    } else {
      Notify.create({
        type: 'negative',
        message: 'Network error',
        position: 'top'
      });
    }
    return Promise.reject(new Error(error));
  }
);

export default ({ app }: { app: App }): void => {
  // Make axios available as $axios in all components
  app.config.globalProperties.$axios = axios;
  // Make our api instance available as $api
  app.config.globalProperties.$api = api;
};

// Export the API for use outside of components
export { api };
