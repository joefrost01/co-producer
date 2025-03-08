<template>
  <q-page padding>
    <div v-if="loading">
      <div class="row justify-center items-center" style="height: 400px">
        <q-spinner color="primary" size="3em" />
      </div>
    </div>

    <div v-else>
      <!-- Artist header -->
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="row items-center">
            <h1 class="text-h4 q-my-none">{{ artist.name }}</h1>
            <q-chip
              v-if="artist.band"
              color="primary"
              text-color="white"
              class="q-ml-md"
            >
              {{ artist.band }}
            </q-chip>
            <q-chip
              v-if="artist.era"
              color="secondary"
              text-color="white"
              class="q-ml-sm"
            >
              {{ artist.era }}
            </q-chip>
          </div>
          <div class="text-subtitle1 q-mt-sm text-grey-8">
            {{ artist.instrument }} • {{ formatDifficulty(artist.difficulty) }}
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            outline
            color="primary"
            icon="edit"
            label="Edit"
            @click="editArtist"
          />
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Artist content -->
      <div class="row q-col-gutter-md">
        <!-- Artist details -->
        <div class="col-12 col-md-4">
          <EntityCard>
            <template #header>
              <div class="text-h6">About</div>
              <p>{{ artist.description }}</p>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Instrument</div>
              <p>{{ artist.instrument }}</p>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Difficulty</div>
              <div class="row items-center">
                <q-rating
                  v-model="difficulty"
                  max="3"
                  size="1.5em"
                  color="primary"
                  icon="circle"
                  readonly
                />
                <span class="q-ml-sm">{{ formatDifficulty(artist.difficulty) }}</span>
              </div>
            </template>

            <template #content>
              <div class="text-subtitle2 q-mb-sm">Tags</div>
              <div v-if="artist.tags && artist.tags.length">
                <q-chip
                  v-for="tag in artist.tags"
                  :key="tag"
                  color="grey-3"
                  text-color="grey-8"
                  class="q-ma-xs"
                >
                  {{ tag }}
                </q-chip>
              </div>
              <div v-else class="text-grey">No tags added</div>
            </template>
          </EntityCard>

          <!-- Gear settings card -->
          <EntityCard class="q-mt-md">
            <template #header>
              <div class="text-h6">Gear Settings</div>
            </template>

            <template #content>
              <div v-if="!artist.gear_settings || artist.gear_settings.length === 0" class="text-center q-py-lg">
                <q-icon name="settings" size="48px" color="grey-5" />
                <p class="text-body1 q-mt-sm">No gear settings defined for this artist</p>
              </div>

              <div v-else>
                <q-expansion-item
                  v-for="gear in artist.gear_settings"
                  :key="gear.gear_name"
                  :label="gear.gear_name"
                  :caption="formatGearType(gear.gear_type)"
                  header-class="text-primary"
                  expand-icon-class="text-primary"
                  class="q-mb-sm"
                >
                  <q-card>
                    <q-card-section>
                      <p v-if="gear.description">{{ gear.description }}</p>

                      <div v-if="Object.keys(gear.settings || {}).length">
                        <div class="text-subtitle2 q-mb-sm">Settings</div>
                        <q-list dense>
                          <q-item v-for="(value, key) in gear.settings" :key="key">
                            <q-item-section>
                              <q-item-label>{{ key }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-item-label>{{ value }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </template>
          </EntityCard>

          <!-- Media card -->
          <EntityCard class="q-mt-md" v-if="artist.media && artist.media.length">
            <template #header>
              <div class="text-h6">Media</div>
            </template>

            <template #content>
              <q-list>
                <q-item v-for="(item, index) in artist.media" :key="index">
                  <q-item-section avatar>
                    <q-icon
                      :name="getMediaIcon(item.media_type)"
                      :color="getMediaColor(item.media_type)"
                      size="md"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ item.title }}</q-item-label>
                    <q-item-label caption v-if="item.description">{{ item.description }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="launch"
                      :href="item.url"
                      target="_blank"
                      rel="noopener"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </EntityCard>
        </div>

        <!-- Techniques section -->
        <div class="col-12 col-md-8">
          <EntityCard>
            <template #header>
              <div class="row justify-between items-center">
                <div class="text-h6">Techniques</div>
                <q-btn
                  flat
                  color="primary"
                  icon="search"
                  label="Filter"
                  @click="showFilter = !showFilter"
                />
              </div>
            </template>

            <template #content>
              <!-- Filter options -->
              <div v-if="showFilter" class="q-py-md">
                <FilterPanel @reset="resetFilters">
                  <template #filters>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model="filter.search"
                          label="Search techniques"
                          outlined
                          dense
                          clearable
                        >
                          <template v-slot:append>
                            <q-icon name="search" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="filter.difficulty"
                          :options="difficultyOptions"
                          label="Difficulty"
                          outlined
                          dense
                          clearable
                          emit-value
                          map-options
                        />
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="filter.status"
                          :options="statusOptions"
                          label="Learning Status"
                          outlined
                          dense
                          clearable
                          emit-value
                          map-options
                        />
                      </div>
                    </div>
                  </template>
                </FilterPanel>
              </div>

              <!-- No techniques message -->
              <div v-if="!artist.techniques || artist.techniques.length === 0" class="text-center q-py-xl">
                <q-icon name="piano" size="48px" color="grey-5" />
                <p class="text-h6 q-mt-md">No techniques</p>
                <p class="text-body1">This artist doesn't have any techniques defined yet.</p>
              </div>

              <!-- Techniques list -->
              <div v-else class="q-mt-md">
                <q-list separator>
                  <q-expansion-item
                    v-for="technique in filteredTechniques"
                    :key="technique.id"
                    :header-class="technique.progress && technique.progress.status === 'Mastered' ? 'text-positive' : ''"
                    expand-icon-class="text-primary"
                  >
                    <template v-slot:header>
                      <q-item-section avatar>
                        <q-avatar :color="getDifficultyColor(technique.difficulty)" text-color="white">
                          {{ technique.difficulty }}
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label>{{ technique.name }}</q-item-label>
                        <q-item-label caption lines="1">{{ truncateText(technique.description, 100) }}</q-item-label>
                      </q-item-section>

                      <q-item-section side v-if="technique.progress">
                        <StatusBadge :status="technique.progress.status" />
                      </q-item-section>
                    </template>

                    <q-card>
                      <q-card-section>
                        <div class="text-subtitle2 q-mb-sm">Description</div>
                        <p>{{ technique.description }}</p>

                        <div v-if="technique.tab_notation" class="q-my-md">
                          <div class="text-subtitle2 q-mb-sm">Tab Notation</div>
                          <pre class="tab-notation">{{ technique.tab_notation }}</pre>
                        </div>

                        <div class="text-subtitle2 q-mb-sm">Instructions</div>
                        <p>{{ technique.instructions }}</p>

                        <div class="text-subtitle2 q-mb-sm">Difficulty</div>
                        <div class="row items-center">
                          <q-rating
                            v-model="technique.difficulty"
                            max="5"
                            size="1em"
                            :color="getDifficultyColor(technique.difficulty)"
                            icon="star"
                            readonly
                          />
                          <span class="q-ml-sm">{{ technique.difficulty }} / 5</span>
                        </div>
                      </q-card-section>

                      <q-separator />

                      <q-card-actions>
                        <q-space />
                        <q-btn-dropdown flat color="primary" label="Update Status">
                          <q-list>
                            <q-item
                              clickable
                              v-close-popup
                              @click="updateProgress(technique.id, 'NotStarted')"
                            >
                              <q-item-section avatar>
                                <q-icon name="schedule" color="grey" />
                              </q-item-section>
                              <q-item-section>Not Started</q-item-section>
                            </q-item>

                            <q-item
                              clickable
                              v-close-popup
                              @click="updateProgress(technique.id, 'InProgress')"
                            >
                              <q-item-section avatar>
                                <q-icon name="trending_up" color="blue" />
                              </q-item-section>
                              <q-item-section>In Progress</q-item-section>
                            </q-item>

                            <q-item
                              clickable
                              v-close-popup
                              @click="updateProgress(technique.id, 'Mastered')"
                            >
                              <q-item-section avatar>
                                <q-icon name="check_circle" color="positive" />
                              </q-item-section>
                              <q-item-section>Mastered</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>

                        <q-btn flat color="secondary" icon="playlist_add" label="Add to Learning Plan" @click="addToLearningPlan(technique)" />
                      </q-card-actions>
                    </q-card>
                  </q-expansion-item>
                </q-list>
              </div>
            </template>
          </EntityCard>
        </div>
      </div>
    </div>

    <!-- Learning Plan Dialog -->
    <q-dialog v-model="planDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add to Learning Plan</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <p class="q-mb-md">Add "<strong>{{ selectedTechnique?.name }}</strong>" to your learning plan.</p>

          <q-form @submit="saveLearningPlan" class="q-gutter-md">
            <q-input
              v-model="learningPlan.target_date"
              label="Target Date"
              outlined
              type="date"
              :rules="[val => !!val || 'Please select a target date']"
            />

            <q-input
              v-model="learningPlan.notes"
              label="Notes"
              outlined
              type="textarea"
              rows="3"
              placeholder="Add any specific practice notes or goals"
            />

            <q-select
              v-model="learningPlan.priority"
              :options="priorityOptions"
              label="Priority"
              outlined
              emit-value
              map-options
              :options-dense="true"
              :rules="[val => !!val || 'Please select a priority']"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon
                      :name="scope.opt.value === 'high' ? 'priority_high' : (scope.opt.value === 'medium' ? 'drag_handle' : 'arrow_downward')"
                      :color="scope.opt.value === 'high' ? 'negative' : (scope.opt.value === 'medium' ? 'warning' : 'positive')"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="row justify-end q-mt-md">
              <q-btn flat label="Cancel" color="grey" v-close-popup class="q-mr-sm" />
              <q-btn unelevated label="Add to Plan" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

// Replace the script section in src/pages/ArtistDetail.vue

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useArtistStore } from 'src/stores/artist-store';
import { useProgressStore } from 'src/stores/progress-store';
import { useConfirmation } from 'src/composables/useConfirmation';
import EntityCard from 'src/components/common/EntityCard.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import FilterPanel from 'src/components/common/FilterPanel.vue';
import { truncateText, getDifficultyColor } from 'src/lib/utils';
import type { Artist, Technique } from 'src/models';

const $q = useQuasar();
const route = useRoute();
//const router = useRouter();
const artistStore = useArtistStore();
const progressStore = useProgressStore();
//const { confirm } = useConfirmation();

const loading = ref(true);
const artist = ref<Artist>({
  id: '',
  name: '',
  band: '',
  era: '',
  description: '',
  instrument: '',
  difficulty: 'moderate',
  tags: [],
  techniques: [],
  gear_settings: [],
  media: [],
  created_at: '',
  updated_at: ''
});
const showFilter = ref(false);
const planDialog = ref(false);
const selectedTechnique = ref<Technique | null>(null);

// Difficulty rating conversion from 'easy', 'moderate', 'challenging' to 1-3
const difficulty = computed(() => {
  switch (artist.value.difficulty) {
    case 'easy': return 1;
    case 'moderate': return 2;
    case 'challenging': return 3;
    default: return 2;
  }
});

// Filter options
const filter = reactive({
  search: '',
  difficulty: null as string | null,
  status: null as string | null
});

const difficultyOptions = [
  { label: 'All Difficulties', value: null },
  { label: 'Beginner (1-2)', value: 'beginner' },
  { label: 'Intermediate (3)', value: 'intermediate' },
  { label: 'Advanced (4-5)', value: 'advanced' }
];

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Not Started', value: 'NotStarted' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Mastered', value: 'Mastered' }
];

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

interface LearningPlan {
  technique_id: string;
  target_date: string;
  notes: string;
  priority: string;
}

const learningPlan = reactive<LearningPlan>({
  technique_id: '',
  target_date: '',
  notes: '',
  priority: 'medium'
});

// Filtered techniques based on search and filters
const filteredTechniques = computed(() => {
  if (!artist.value.techniques) return [];

  return artist.value.techniques.filter(technique => {
    // Search filter
    if (filter.search && !technique.name.toLowerCase().includes(filter.search.toLowerCase()) &&
      !technique.description.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }

    // Difficulty filter
    if (filter.difficulty) {
      const diff = typeof technique.difficulty === 'string'
        ? parseInt(technique.difficulty)
        : technique.difficulty;

      if (filter.difficulty === 'beginner' && (diff > 2)) return false;
      if (filter.difficulty === 'intermediate' && diff !== 3) return false;
      if (filter.difficulty === 'advanced' && (diff < 4)) return false;
    }

    // Status filter
    if (filter.status && (!technique.progress || technique.progress.status !== filter.status)) {
      return false;
    }

    return true;
  });
});

onMounted(async () => {
  try {
    const id = route.params.id as string;
    const artistData = await artistStore.fetchArtist(id);
    artist.value = { ...artistData };
  } catch (_error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load artist',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

function formatDifficulty(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'Easy';
    case 'moderate': return 'Moderate';
    case 'challenging': return 'Challenging';
    default: return difficulty;
  }
}

function formatGearType(type: string): string {
  const typeMap: Record<string, string> = {
    'amp': 'Amplifier',
    'pedal': 'Pedal/Effect',
    'instrument': 'Instrument',
    'plugin': 'Plugin',
    'software': 'Software',
    'daw': 'DAW',
    'hardware': 'Hardware',
    'other': 'Other'
  };

  return typeMap[type] || type;
}

function getMediaIcon(type: string): string {
  switch (type) {
    case 'youtube': return 'videocam';
    case 'image': return 'image';
    case 'audio': return 'audiotrack';
    default: return 'link';
  }
}

function getMediaColor(type: string): string {
  switch (type) {
    case 'youtube': return 'red';
    case 'image': return 'green';
    case 'audio': return 'blue';
    default: return 'grey';
  }
}

function resetFilters(): void {
  filter.search = '';
  filter.difficulty = null;
  filter.status = null;
}

function editArtist(): void {
  // In a real app, this would open the edit form or navigate to an edit page
  // For now, we'll just show a notification
  $q.notify({
    color: 'info',
    position: 'top',
    message: 'Edit artist: ' + artist.value.name,
    icon: 'edit'
  });
}

async function updateProgress(techniqueId: string, status: string): Promise<void> {
  try {
    await progressStore.updateTechniqueProgress(techniqueId, { status });

    // Update the technique in our local artist object
    const technique = artist.value.techniques.find(t => t.id === techniqueId);
    if (technique) {
      if (!technique.progress) {
        technique.progress = { status };
      } else {
        technique.progress.status = status;
      }
    }

    $q.notify({
      color: 'positive',
      position: 'top',
      message: `Progress updated to ${status === 'NotStarted' ? 'Not Started' : status === 'InProgress' ? 'In Progress' : 'Mastered'}`,
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to update progress',
      icon: 'report_problem'
    });
  }
}

function addToLearningPlan(technique: Technique): void {
  selectedTechnique.value = technique;
  learningPlan.technique_id = technique.id;

  // Create a date 2 weeks from now
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  // Format date as YYYY-MM-DD
  const dateStr = futureDate.toISOString().split('T')[0];

  if (dateStr) {
    learningPlan.target_date = dateStr;
    learningPlan.notes = '';
    learningPlan.priority = 'medium';
    planDialog.value = true;
  }
}

async function saveLearningPlan(): Promise<void> {
  try {
    // Use await since we need to handle promise rejection
    await progressStore.addToLearningPlan(learningPlan);

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Technique added to learning plan',
      icon: 'check'
    });

    planDialog.value = false;
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to add technique to learning plan',
      icon: 'report_problem'
    });
  }
}
</script>

<style lang="scss" scoped>
.tab-notation {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
}
</style>
