import { defineStore } from 'pinia';
import axios from 'axios';
import { useTechniqueStore } from './technique-store';

const API_URL = '/api';

interface ProgressData {
  [key: string]: any;
}

interface LearningPlanItem {
  id: string;
  technique_id: string;
  target_date: string;
  notes?: string;
  priority?: string;
  created_at?: string;
}

interface ActivityItem {
  id?: string;
  type?: string;
  timestamp: string;
  technique_id?: string;
  technique_name?: string;
  artist_id?: string;
  artist_name?: string;
  status?: string;
  notes?: string;
  plan_id?: string;
  target_date?: string;
  priority?: string;
}

export const useProgressStore = defineStore('progress', {
  state: () => ({
    progressData: {} as ProgressData,
    learningPlan: [] as LearningPlanItem[],
    recentActivity: [] as ActivityItem[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    // Get overall progress statistics
    overallProgress: (state) => {
      const techniqueStore = useTechniqueStore();
      return techniqueStore.progressStats;
    },

    // Get progress for a specific technique
    getTechniqueProgress: (state) => (techniqueId: string) => {
      return state.progressData[techniqueId] || null;
    },

    // Get learning plan items sorted by target date
    sortedLearningPlan: (state) => {
      return [...state.learningPlan].sort((a, b) => {
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
      });
    },

    // Get learning plan items that are due (target date is today or earlier)
    dueLearningItems: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return state.learningPlan.filter(item => {
        const targetDate = new Date(item.target_date);
        targetDate.setHours(0, 0, 0, 0);
        return targetDate <= today;
      });
    },

    // Get recent activity sorted by timestamp (newest first)
    sortedRecentActivity: (state) => {
      return [...state.recentActivity].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    }
  },

  actions: {
    async fetchProgress() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_URL}/progress`);
        this.progressData = response.data.techniques || {};
        this.learningPlan = response.data.learningPlan || [];
        this.recentActivity = response.data.recentActivity || [];
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTechniqueProgress(techniqueId: string, progressUpdate: Record<string, any>) {
      this.loading = true;
      try {
        // Update technique in the technique store first
        const techniqueStore = useTechniqueStore();
        const updatedTechnique = await techniqueStore.updateTechniqueProgress(techniqueId, progressUpdate);

        // Now update our local progress data
        this.progressData[techniqueId] = {
          ...this.getTechniqueProgress(techniqueId),
          ...progressUpdate,
          updated_at: new Date().toISOString()
        };

        // Add activity record
        this.addActivity({
          type: 'progress_update',
          timestamp: new Date().toISOString(),
          technique_id: techniqueId,
          technique_name: updatedTechnique.name,
          artist_id: updatedTechnique.artist_id,
          artist_name: updatedTechnique.artist_name,
          status: progressUpdate.status,
          notes: progressUpdate.notes
        });

        return this.progressData[techniqueId];
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addToLearningPlan(plan: Partial<LearningPlanItem>) {
      this.loading = true;
      try {
        // In a real application, this would call an API
        // For this example, we'll just add it to our local state

        const newPlan = {
          id: Date.now().toString(),
          ...plan,
          created_at: new Date().toISOString()
        } as LearningPlanItem;

        this.learningPlan.push(newPlan);

        // Add activity record
        const techniqueStore = useTechniqueStore();
        if (plan.technique_id) {
          const technique = techniqueStore.getTechniqueById(plan.technique_id);

          if (technique) {
            this.addActivity({
              type: 'learning_plan_add',
              timestamp: new Date().toISOString(),
              plan_id: newPlan.id,
              technique_id: technique.id,
              technique_name: technique.name,
              target_date: plan.target_date,
              priority: plan.priority
            });
          }
        }

        return newPlan;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeLearningPlanItem(id: string) {
      this.loading = true;
      try {
        // In a real application, this would call an API
        // For this example, we'll just remove it from our local state

        const planItem = this.learningPlan.find(item => item.id === id);

        if (!planItem) {
          throw new Error('Learning plan item not found');
        }

        this.learningPlan = this.learningPlan.filter(item => item.id !== id);

        // Add activity record
        const techniqueStore = useTechniqueStore();
        if (planItem.technique_id) {
          const technique = techniqueStore.getTechniqueById(planItem.technique_id);

          if (technique) {
            this.addActivity({
              type: 'learning_plan_remove',
              timestamp: new Date().toISOString(),
              plan_id: id,
              technique_id: technique.id,
              technique_name: technique.name
            });
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async completeLearningPlanItem(id: string) {
      this.loading = true;
      try {
        const planItem = this.learningPlan.find(item => item.id === id);

        if (!planItem) {
          throw new Error('Learning plan item not found');
        }

        // Update technique progress to Mastered
        if (planItem.technique_id) {
          await this.updateTechniqueProgress(planItem.technique_id, {
            status: 'Mastered',
            notes: 'Completed from learning plan'
          });

          // Remove from learning plan
          await this.removeLearningPlanItem(id);

          // Add activity record
          const techniqueStore = useTechniqueStore();
          const technique = techniqueStore.getTechniqueById(planItem.technique_id);

          if (technique) {
            this.addActivity({
              type: 'learning_plan_complete',
              timestamp: new Date().toISOString(),
              plan_id: id,
              technique_id: technique.id,
              technique_name: technique.name
            });
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    addActivity(activity: ActivityItem) {
      // Add activity to recent activity
      this.recentActivity.push(activity);

      // Keep only the most recent 100 activities
      if (this.recentActivity.length > 100) {
        this.recentActivity = this.recentActivity.slice(-100);
      }
    }
  }
});
