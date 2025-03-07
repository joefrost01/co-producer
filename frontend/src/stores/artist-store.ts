import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = '/api';

export const useArtistStore = defineStore('artist', {
  state: () => ({
    artists: [],
    loading: false,
    error: null
  }),

  getters: {
    getArtistById: (state) => (id) => {
      return state.artists.find(artist => artist.id === id);
    },

    getArtistsByInstrument: (state) => (instrument) => {
      return state.artists.filter(artist => artist.instrument === instrument);
    },

    getArtistsByTag: (state) => (tag) => {
      return state.artists.filter(artist => artist.tags.includes(tag));
    },

    getAllTechniques: (state) => {
      let techniques = [];
      state.artists.forEach(artist => {
        if (artist.techniques && artist.techniques.length) {
          // Add artist name to each technique for reference
          const artistTechniques = artist.techniques.map(technique => ({
            ...technique,
            artist_id: artist.id,
            artist_name: artist.name
          }));
          techniques = [...techniques, ...artistTechniques];
        }
      });
      return techniques;
    }
  },

  actions: {
    async fetchArtists() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/artists`);
        this.artists = response.data;
        return this.artists;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchArtist(id) {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/artists/${id}`);

        // Update artist in the artists array if it exists
        const index = this.artists.findIndex(a => a.id === id);
        if (index !== -1) {
          this.artists[index] = response.data;
        } else {
          this.artists.push(response.data);
        }

        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createArtist(artist) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/artists`, artist);
        this.artists.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateArtist(artist) {
      this.loading = true;
      try {
        const response = await axios.put(`${API_URL}/artists/${artist.id}`, artist);

        // Update artist in the artists array
        const index = this.artists.findIndex(a => a.id === artist.id);
        if (index !== -1) {
          this.artists[index] = response.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteArtist(id) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/artists/${id}`);

        // Remove artist from the artists array
        this.artists = this.artists.filter(a => a.id !== id);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addTechniqueToArtist(artistId, technique) {
      const artist = this.getArtistById(artistId);

      if (!artist) {
        throw new Error('Artist not found');
      }

      // Add technique to artist's techniques
      if (!artist.techniques) {
        artist.techniques = [];
      }

      // If technique doesn't have an ID, generate a temporary one
      if (!technique.id) {
        technique.id = Date.now().toString();
      }

      artist.techniques.push(technique);

      // Update the artist
      return this.updateArtist(artist);
    },

    async updateTechnique(artistId, technique) {
      const artist = this.getArtistById(artistId);

      if (!artist) {
        throw new Error('Artist not found');
      }

      // Find and update the technique
      const index = artist.techniques.findIndex(t => t.id === technique.id);

      if (index === -1) {
        throw new Error('Technique not found');
      }

      artist.techniques[index] = technique;

      // Update the artist
      return this.updateArtist(artist);
    },

    async deleteTechnique(artistId, techniqueId) {
      const artist = this.getArtistById(artistId);

      if (!artist) {
        throw new Error('Artist not found');
      }

      // Remove the technique
      artist.techniques = artist.techniques.filter(t => t.id !== techniqueId);

      // Update the artist
      return this.updateArtist(artist);
    }
  }
});
