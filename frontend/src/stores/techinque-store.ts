import { defineStore } from 'pinia';
import { useArtistStore } from './artist-store';

export const useTechniqueStore = defineStore('technique', {
  state: () => ({
    loading: false,
    error: null
  }),

  getters: {
    // Get all techniques from all artists
    techniques: () => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques;
    },

    getTechniqueById: (state) => (id) => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.find(technique => technique.id === id);
    },

    getTechniquesByDifficulty: (state) => (difficulty) => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.difficulty === difficulty);
    },

    getTechniquesByStatus: (state) => (status) => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.progress?.status === status);
    },

    masteredTechniques: (state) => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.progress?.status === 'Mastered');
    },

    inProgressTechniques: (state) => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.progress?.status === 'InProgress');
    },

    notStartedTechniques: (state) => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique =>
        !technique.progress || technique.progress.status === 'NotStarted'
      );
    },

    // Progress statistics
    progressStats: (state) => {
      const total = state.techniques.length;
      const mastered = state.masteredTechniques.length;
      const inProgress = state.inProgressTechniques.length;
      const notStarted = state.notStartedTechniques.length;

      return {
        total,
        mastered,
        inProgress,
        notStarted,
        masteredPercentage: total > 0 ? (mastered / total) * 100 : 0,
        inProgressPercentage: total > 0 ? (inProgress / total) * 100 : 0,
        notStartedPercentage: total > 0 ? (notStarted / total) * 100 : 0
      };
    }
  },

  actions: {
    async fetchTechniques() {
      this.loading = true;
      try {
        const artistStore = useArtistStore();
        await artistStore.fetchArtists();
        return this.techniques;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTechniqueProgress(techniqueId, progressUpdate) {
      this.loading = true;
      try {
        // Find the technique and its artist
        const technique = this.getTechniqueById(techniqueId);

        if (!technique) {
          throw new Error('Technique not found');
        }

        const artistStore = useArtistStore();
        const artist = artistStore.getArtistById(technique.artist_id);

        if (!artist) {
          throw new Error('Artist not found');
        }

        // Find the technique in the artist's techniques array
        const artistTechnique = artist.techniques.find(t => t.id === techniqueId);

        if (!artistTechnique) {
          throw new Error('Technique not found in artist');
        }

        // Update the technique progress
        artistTechnique.progress = {
          ...artistTechnique.progress,
          ...progressUpdate,
          updated_at: new Date().toISOString()
        };

        // Update the artist
        await artistStore.updateArtist(artist);

        return artistTechnique;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
