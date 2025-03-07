import { defineStore } from 'pinia';
import axios from 'axios';
import { useArtistStore } from './artist-store';
import { useProjectStore } from './project-store';

const API_URL = '/api';

export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [],
    loading: false,
    error: null
  }),

  getters: {
    tagUsageCount: (state) => {
      const counts = {};

      // Initialize all tags with count 0
      state.tags.forEach(tag => {
        counts[tag] = 0;
      });

      // Count usage in artists
      const artistStore = useArtistStore();
      artistStore.artists.forEach(artist => {
        artist.tags?.forEach(tag => {
          if (counts[tag] !== undefined) {
            counts[tag]++;
          }
        });
      });

      // Count usage in projects
      const projectStore = useProjectStore();
      projectStore.projects.forEach(project => {
        if (project.tags) {
          project.tags.forEach(tag => {
            if (counts[tag] !== undefined) {
              counts[tag]++;
            }
          });
        }
      });

      return counts;
    },

    // Tags sorted by usage (most used first)
    tagsByUsage: (state) => {
      const counts = state.tagUsageCount;
      return [...state.tags].sort((a, b) => counts[b] - counts[a]);
    },

    // Tags that are not being used
    unusedTags: (state) => {
      const counts = state.tagUsageCount;
      return state.tags.filter(tag => counts[tag] === 0);
    }
  },

  actions: {
    async fetchTags() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/tags`);
        this.tags = response.data;
        return this.tags;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTag(tag) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/tags`, { name: tag });
        this.tags.push(tag);
        return tag;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTag(tag) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/tags/${encodeURIComponent(tag)}`);

        // Remove tag from the tags array
        this.tags = this.tags.filter(t => t !== tag);

        // Also remove tag from all artists and projects
        const artistStore = useArtistStore();
        artistStore.artists.forEach(artist => {
          if (artist.tags?.includes(tag)) {
            artist.tags = artist.tags.filter(t => t !== tag);
            artistStore.updateArtist(artist);
          }
        });

        const projectStore = useProjectStore();
        projectStore.projects.forEach(project => {
          if (project.tags?.includes(tag)) {
            project.tags = project.tags.filter(t => t !== tag);
            projectStore.updateProject(project);
          }
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async mergeTags(sourceTag, targetTag) {
      this.loading = true;
      try {
        await axios.post(`${API_URL}/tags/merge`, {
          source: sourceTag,
          target: targetTag
        });

        // Replace sourceTag with targetTag in all artists
        const artistStore = useArtistStore();
        artistStore.artists.forEach(artist => {
          if (artist.tags?.includes(sourceTag)) {
            artist.tags = artist.tags.filter(t => t !== sourceTag);
            if (!artist.tags.includes(targetTag)) {
              artist.tags.push(targetTag);
            }
            artistStore.updateArtist(artist);
          }
        });

        // Replace sourceTag with targetTag in all projects
        const projectStore = useProjectStore();
        projectStore.projects.forEach(project => {
          if (project.tags?.includes(sourceTag)) {
            project.tags = project.tags.filter(t => t !== sourceTag);
            if (!project.tags.includes(targetTag)) {
              project.tags.push(targetTag);
            }
            projectStore.updateProject(project);
          }
        });

        // Remove sourceTag from tags array
        this.tags = this.tags.filter(t => t !== sourceTag);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addTagToArtist(artistId, tag) {
      // Ensure tag exists
      if (!this.tags.includes(tag)) {
        await this.createTag(tag);
      }

      // Add tag to artist
      const artistStore = useArtistStore();
      const artist = artistStore.getArtistById(artistId);

      if (!artist) {
        throw new Error('Artist not found');
      }

      if (!artist.tags) {
        artist.tags = [];
      }

      if (!artist.tags.includes(tag)) {
        artist.tags.push(tag);
        await artistStore.updateArtist(artist);
      }
    },

    async removeTagFromArtist(artistId, tag) {
      const artistStore = useArtistStore();
      const artist = artistStore.getArtistById(artistId);

      if (!artist) {
        throw new Error('Artist not found');
      }

      if (artist.tags?.includes(tag)) {
        artist.tags = artist.tags.filter(t => t !== tag);
        await artistStore.updateArtist(artist);
      }
    },

    async addTagToProject(projectId, tag) {
      // Ensure tag exists
      if (!this.tags.includes(tag)) {
        await this.createTag(tag);
      }

      // Add tag to project
      const projectStore = useProjectStore();
      const project = projectStore.getProjectById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      if (!project.tags) {
        project.tags = [];
      }

      if (!project.tags.includes(tag)) {
        project.tags.push(tag);
        await projectStore.updateProject(project);
      }
    },

    async removeTagFromProject(projectId, tag) {
      const projectStore = useProjectStore();
      const project = projectStore.getProjectById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      if (project.tags?.includes(tag)) {
        project.tags = project.tags.filter(t => t !== tag);
        await projectStore.updateProject(project);
      }
    }
  }
});
