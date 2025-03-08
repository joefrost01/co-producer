import { defineStore } from 'pinia';
import axios from 'axios';
import { Project, Briefing } from 'src/models';

const API_URL = '/api';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [] as Project[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getProjectById: (state) => (id: string): Project | undefined => {
      return state.projects.find(project => project.id === id);
    },

    getProjectsByArtist: (state) => (artistId: string): Project[] => {
      return state.projects.filter(project => project.collaborators.includes(artistId));
    },

    getProjectsByGear: (state) => (gearId: string): Project[] => {
      return state.projects.filter(project => project.equipment.includes(gearId));
    },

    getProjectsByTag: (state) => (tag: string): Project[] => {
      return state.projects.filter(project => project.tags && project.tags.includes(tag));
    },

    getRecentProjects: (state) => (limit = 5): Project[] => {
      return [...state.projects]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, limit);
    }
  },

  actions: {
    async fetchProjects() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/projects`);
        this.projects = response.data;
        return this.projects;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProject(id: string) {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/projects/${id}`);

        // Update project in the projects array if it exists
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index] = response.data;
        } else {
          this.projects.push(response.data);
        }

        return response.data as Project;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProject(project: Partial<Project>) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/projects`, project);
        this.projects.push(response.data);
        return response.data as Project;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProject(project: Project) {
      this.loading = true;
      try {
        const response = await axios.put(`${API_URL}/projects/${project.id}`, project);

        // Update project in the projects array
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          this.projects[index] = response.data;
        }

        return response.data as Project;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProject(id: string) {
      this.loading = true;
      try {
        await axios.delete(`${API_URL}/projects/${id}`);

        // Remove project from the projects array
        this.projects = this.projects.filter(p => p.id !== id);
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async duplicateProject(id: string) {
      this.loading = true;
      try {
        const projectToDuplicate = this.getProjectById(id);

        if (!projectToDuplicate) {
          throw new Error('Project not found');
        }

        // Create a new project based on the existing one, but omit specific fields
        // to avoid TypeScript errors with undefined values
        const { id: _, created_at, updated_at, ...restOfProject } = projectToDuplicate;

        const newProject: Partial<Project> = {
          ...restOfProject,
          title: `${projectToDuplicate.title} (Copy)`
        };

        return await this.createProject(newProject);
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async generateBriefing(projectId: string) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/projects/${projectId}/generate-briefing`);

        // Update project in the projects array
        const project = this.getProjectById(projectId);
        if (project) {
          project.has_briefing = true;
        }

        return response.data;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBriefing(projectId: string) {
      try {
        const response = await axios.get(`${API_URL}/projects/${projectId}/briefing`);
        return response.data as Briefing;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchBriefingMarkdown(projectId: string) {
      try {
        const response = await axios.get(`${API_URL}/projects/${projectId}/briefing/markdown`);
        return response.data as string;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchBriefingJson(projectId: string) {
      try {
        const response = await axios.get(`${API_URL}/projects/${projectId}/briefing/json`);
        return response.data as any;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    }
  }
});
