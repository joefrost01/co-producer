<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Dashboard</h1>
      <q-btn
        color="primary"
        icon="add"
        label="New Project"
        to="/projects/new"
        unelevated
      />
    </div>

    <q-separator class="q-mb-md" />

    <div v-if="loading" class="row justify-center items-center" style="height: 200px">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <!-- Stats Cards -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="dashboard-stat">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h3 text-primary">{{ stats.projectCount }}</div>
                <div class="text-subtitle1">Projects</div>
              </div>
              <q-icon name="folder" size="3em" color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="dashboard-stat">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h3 text-secondary">{{ stats.artistCount }}</div>
                <div class="text-subtitle1">Artists</div>
              </div>
              <q-icon name="person" size="3em" color="secondary" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="dashboard-stat">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h3 text-purple">{{ stats.techniqueCount }}</div>
                <div class="text-subtitle1">Techniques</div>
              </div>
              <q-icon name="piano" size="3em" color="purple" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="dashboard-stat">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h3 text-orange">{{ stats.masteredTechniques }}</div>
                <div class="text-subtitle1">Mastered</div>
              </div>
              <q-icon name="check_circle" size="3em" color="orange" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Projects -->
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">Recent Projects</div>
              <q-btn flat color="primary" label="View All" to="/projects" />
            </div>

            <q-list separator>
              <q-item v-for="project in recentProjects" :key="project.id" clickable :to="`/projects/${project.id}`">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ project.title.charAt(0) }}
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ project.title }}</q-item-label>
                  <q-item-label caption>{{ truncateText(project.description, 80) }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-caption">
                    Updated {{ formatDate(project.updated_at) }}
                  </div>
                  <q-badge v-if="project.has_briefing" color="secondary" text-color="white" class="q-ml-sm">
                    Briefing
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="recentProjects.length === 0" class="text-center q-pa-md">
              <p class="text-body1">No projects yet. Create your first project to get started!</p>
              <q-btn color="primary" label="Create Project" to="/projects/new" unelevated class="q-mt-sm" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Learning Progress -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">Learning Progress</div>
              <q-btn flat color="primary" label="View All" to="/progress" />
            </div>

            <div class="q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-subtitle2">Techniques Mastered</div>
                <div class="text-caption">{{ stats.masteredTechniques }} / {{ stats.techniqueCount }}</div>
              </div>
              <q-linear-progress
                :value="stats.techniqueCount > 0 ? stats.masteredTechniques / stats.techniqueCount : 0"
                color="positive"
                class="q-mt-xs"
                size="10px"
              />
            </div>

            <q-list separator>
              <q-item v-for="technique in recentTechniques" :key="technique.id">
                <q-item-section>
                  <q-item-label>{{ technique.name }}</q-item-label>
                  <q-item-label caption>{{ truncateText(technique.description, 60) }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge :color="getProgressColor(technique.progress.status)" text-color="white">
                    {{ formatProgressStatus(technique.progress.status) }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-if="recentTechniques.length === 0" class="text-center q-pa-md">
              <p class="text-body1">No techniques tracked yet.</p>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Project Timeline -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Activity Timeline</div>

            <q-timeline color="secondary">
              <q-timeline-entry
                v-for="activity in activities"
                :key="activity.id"
                :title="activity.title"
                :subtitle="formatDate(activity.timestamp) + ' at ' + formatTime(activity.timestamp)"
                :icon="activity.icon"
                :color="activity.color"
              >
                <div>{{ activity.description }}</div>
              </q-timeline-entry>

              <q-timeline-entry v-if="activities.length === 0" title="No Recent Activity" icon="history" color="grey">
                <div>Your activity will appear here as you work on projects, techniques, and more.</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProjectStore } from 'src/stores/project-store';
import { useArtistStore } from 'src/stores/artist-store';
import { useTechniqueStore } from 'src/stores/technique-store';
import { useProgressStore } from 'src/stores/progress-store';

const projectStore = useProjectStore();
const artistStore = useArtistStore();
const techniqueStore = useTechniqueStore();
const progressStore = useProgressStore();

const loading = ref(true);
const recentProjects = ref([]);
const recentTechniques = ref([]);
const activities = ref([]);

const stats = computed(() => {
  return {
    projectCount: projectStore.projects.length,
    artistCount: artistStore.artists.length,
    techniqueCount: techniqueStore.techniques.length,
    masteredTechniques: techniqueStore.techniques.filter(t => t.progress.status === 'Mastered').length
  };
});

onMounted(async () => {
  try {
    // Load all required data
    await Promise.all([
      projectStore.fetchProjects(),
      artistStore.fetchArtists(),
      techniqueStore.fetchTechniques(),
      progressStore.fetchProgress()
    ]);

    // Get recent projects
    recentProjects.value = [...projectStore.projects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    // Get recent techniques with progress
    recentTechniques.value = [...techniqueStore.techniques]
      .sort((a, b) => {
        if (a.progress.status === 'Mastered' && b.progress.status !== 'Mastered') return -1;
        if (a.progress.status !== 'Mastered' && b.progress.status === 'Mastered') return 1;
        return 0;
      })
      .slice(0, 5);

    // Get recent activities
    activities.value = generateMockActivities(); // Replace with actual API call when available

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
});

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatProgressStatus(status) {
  switch (status) {
    case 'NotStarted': return 'Not Started';
    case 'InProgress': return 'In Progress';
    case 'Mastered': return 'Mastered';
    default: return status;
  }
}

function getProgressColor(status) {
  switch (status) {
    case 'NotStarted': return 'grey';
    case 'InProgress': return 'blue';
    case 'Mastered': return 'positive';
    default: return 'grey';
  }
}

// This function generates mock activity data for the timeline
// Replace with actual data from the API when available
function generateMockActivities() {
  const now = new Date();

  return [
    {
      id: 1,
      title: 'Project Created',
      description: `Created new project "${recentProjects.value.length > 0 ? recentProjects.value[0].title : 'Example Project'}"`,
      timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      icon: 'add',
      color: 'primary'
    },
    {
      id: 2,
      title: 'Briefing Generated',
      description: 'Generated AI briefing for the project',
      timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      icon: 'description',
      color: 'secondary'
    },
    {
      id: 3,
      title: 'Technique Mastered',
      description: `Mastered technique "${recentTechniques.value.length > 0 ? recentTechniques.value[0].name : 'Example Technique'}"`,
      timestamp: new Date(now.getTime() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
      icon: 'check_circle',
      color: 'positive'
    }
  ];
}
</script>

<style lang="scss" scoped>
.dashboard-stat {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
