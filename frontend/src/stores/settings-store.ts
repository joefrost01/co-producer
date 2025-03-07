import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = '/api';

export interface Settings {
  username: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
  defaultInstrument: string;
  aiMode: 'online' | 'offline';
  apiKey: string;
  detailedBriefings: boolean;
  maxTokens: number;
  dbLocation: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface BackupData {
  version: string;
  date: string;
  settings: Settings;
  artists: any[];
  projects: any[];
  techniques: any[];
  gear: any[];
  [key: string]: any;
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      username: '',
      email: '',
      theme: 'light' as 'light' | 'dark' | 'system',
      defaultInstrument: 'guitar',
      aiMode: 'offline' as 'online' | 'offline',
      apiKey: '',
      detailedBriefings: true,
      maxTokens: 2000,
      dbLocation: './data/database',
      autoBackup: false,
      backupFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly'
    },
    loading: false,
    error: null as string | null
  }),

  getters: {
    isDarkMode: (state): boolean => {
      if (state.settings.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.settings.theme === 'dark';
    }
  },

  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/settings`);
        this.settings = { ...this.settings, ...response.data };
        this.applyTheme();
        return this.settings;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSettings(settings: Partial<Settings>) {
      this.loading = true;
      try {
        const response = await axios.put(`${API_URL}/settings`, settings);
        this.settings = { ...this.settings, ...response.data };
        this.applyTheme();
        return this.settings;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    applyTheme() {
      // Apply the theme to the document
      const darkMode = this.isDarkMode;
      document.documentElement.classList.toggle('dark', darkMode);

      // Set theme-color meta tag for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', darkMode ? '#121212' : '#ffffff');
      }
    },

    async createBackup() {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/backup`);
        return response.data as BackupData;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async restoreBackup(backupData: BackupData) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/restore`, backupData);
        return response.data;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async clearAllData() {
      this.loading = true;
      try {
        // This would call an API endpoint to clear all data in a real application
        // For this example, we'll just simulate clearing by making a special request
        await axios.post(`${API_URL}/settings/clear-data`);

        return true;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
