import { defineStore } from 'pinia';
import { useArtistStore } from './artist-store';

export interface Technique {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  tab_notation?: string;
  instructions: string;
  artist_id: string;
  artist_name: string;
  progress: {
    status: string;
    started_at?: string;
    completed_at?: string;
    notes?: string;
    updated_at?: string;
  };
}

export const useTechniqueStore = defineStore('technique', {
  state: () => ({
    loading: false,
    error: null as string | null
  }),

  getters: {
    // Get all techniques from all artists
    techniques(): Technique[] {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques;
    },

    getTechniqueById: (state) => (id: string): Technique | undefined => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.find(technique => technique.id === id);
    },

    getTechniquesByDifficulty: (state) => (difficulty: number): Technique[] => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.difficulty === difficulty);
    },

    getTechniquesByStatus: (state) => (status: string): Technique[] => {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.progress?.status === status);
    },

    masteredTechniques(): Technique[] {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.progress?.status === 'Mastered');
    },

    inProgressTechniques(): Technique[] {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique => technique.progress?.status === 'InProgress');
    },

    notStartedTechniques(): Technique[] {
      const artistStore = useArtistStore();
      return artistStore.getAllTechniques.filter(technique =>
        !technique.progress || technique.progress.status === 'NotStarted'
      );
    },

    // Progress statistics
    progressStats(): {
      total: number;
      mastered: number;
      inProgress: number;
      notStarted: number;
      masteredPercentage: number;
      inProgressPercentage: number;
      notStartedPercentage: number;
    } {
      const total = this.techniques.length;
      const mastered = this.masteredTechniques.length;
      const inProgress = this.inProgressTechniques.length;
      const notStarted = this.notStartedTechniques.length;

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
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTechniqueProgress(techniqueId: string, progressUpdate: any) {
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
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
