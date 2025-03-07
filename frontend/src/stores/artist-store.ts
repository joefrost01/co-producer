import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = '/api';

export interface Technique {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  tab_notation?: string;
  instructions: string;
  progress: {
    status: string;
    started_at?: string;
    completed_at?: string;
    notes?: string;
    updated_at?: string;
  };
}

export interface GearSetting {
  gear_type: string;
  gear_name: string;
  settings: Record<string, string>;
  description: string;
}

export interface Media {
  media_type: string;
  title: string;
  url: string;
  description?: string;
}

export interface Artist {
  id: string;
  name: string;
  band?: string;
  era?: string;
  description: string;
  instrument: string;
  difficulty: string;
  tags: string[];
  techniques: Technique[];
  gear_settings: GearSetting[];
  media: Media[];
  created_at: string;
  updated_at: string;
}

export const useArtistStore = defineStore('artist', {
  state: () => ({
    artists: [] as Artist[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getArtistById: (state) => (id: string): Artist | undefined => {
      return state.artists.find(artist => artist.id === id);
    },

    getArtistsByInstrument: (state) => (instrument: string): Artist[] => {
      return state.artists.filter(artist => artist.instrument === instrument);
    },

    getArtistsByTag: (state) => (tag: string): Artist[] => {
      return state.artists.filter(artist => artist.tags.includes(tag));
    },

    getAllTechniques: (state) => {
      let techniques: (Technique & { artist_id: string; artist_name: string })[] = [];
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
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchArtist(id: string) {
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

        return response.data as Artist;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createArtist(artist: Partial<Artist>) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/artists`, artist);
        this.artists.push(response.data);
        return response.data as Artist;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateArtist(artist: Artist) {
      this.loading = true;
      try {
        const response = await axios.put(`${API_URL}/artists/${artist.id}`, artist);

        // Update artist in the artists array
        const index = this.artists.findIndex(a => a.id === artist.id);
        if (index !== -1) {
          this.artists[index] = response.data;
        }

        return response.data as Artist;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteArtist(id: string) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/artists/${id}`);

        // Remove artist from the artists array
        this.artists = this.artists.filter(a => a.id !== id);
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addTechniqueToArtist(artistId: string, technique: Partial<Technique>) {
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

      artist.techniques.push(technique as Technique);

      // Update the artist
      return this.updateArtist(artist);
    },

    async updateTechnique(artistId: string, technique: Technique) {
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

    async deleteTechnique(artistId: string, techniqueId: string) {
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
