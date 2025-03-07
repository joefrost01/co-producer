import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = '/api';

export const useGearStore = defineStore('gear', {
  state: () => ({
    gear: [],
    loading: false,
    error: null
  }),

  getters: {
    getGearById: (state) => (id) => {
      return state.gear.find(item => item.id === id);
    },

    getGearByType: (state) => (type) => {
      return state.gear.filter(item => item.gear_type === type);
    },

    gearTypes: (state) => {
      const types = new Set(state.gear.map(item => item.gear_type));
      return Array.from(types);
    }
  },

  actions: {
    async fetchGear() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/gear`);
        this.gear = response.data;
        return this.gear;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchGearItem(id) {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/gear/${id}`);

        // Update gear item in the gear array if it exists
        const index = this.gear.findIndex(g => g.id === id);
        if (index !== -1) {
          this.gear[index] = response.data;
        } else {
          this.gear.push(response.data);
        }

        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createGear(gear) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/gear`, gear);
        this.gear.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateGear(gear) {
      this.loading = true;
      try {
        const response = await axios.put(`${API_URL}/gear/${gear.id}`, gear);

        // Update gear item in the gear array
        const index = this.gear.findIndex(g => g.id === gear.id);
        if (index !== -1) {
          this.gear[index] = response.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteGear(id) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/gear/${id}`);

        // Remove gear item from the gear array
        this.gear = this.gear.filter(g => g.id !== id);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
