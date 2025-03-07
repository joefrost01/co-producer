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
          <q-card flat bordered>
            <q-card-section>
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

              <q-separator class="q-my-md" />

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
            </q-card-section>
          </q-card>

          <!-- Gear settings card -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Gear Settings</div>

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
            </q-card-section>
          </q-card>

          <!-- Media card -->
          <q-card flat bordered class="q-mt-md" v-if="artist.media && artist.media.length">
            <q-card-section>
              <div class="text-h6">Media</div>

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
            </q-card-section>
          </q-card>
        </div>

        <!-- Techniques section -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
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

              <!-- Filter options -->
              <div v-if="showFilter" class="q-py-md">
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
                        <q-avatar :color="getTechniqueColor(technique)" text-color="white">
                          {{ technique.difficulty }}
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label>{{ technique.name }}</q-item-label>
                        <q-item-label caption lines="1">{{ truncateText(technique.description, 100) }}</q-item-label>
                      </q-item-section>

                      <q-item-section side v-if="technique.progress">
                        <q-badge :color="getProgressColor(technique.progress.status)">
                          {{ formatProgressStatus(technique.progress.status) }}
                        </q-badge>
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
            </q-card-section>
          </q-card>
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

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useArtistStore } from 'src/stores/artist-store';
import { useProgressStore } from 'src/stores/progress-store';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const artistStore = useArtistStore();
const progressStore = useProgressStore();

const loading = ref(true);
const artist = ref({
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
const selectedTechnique = ref(null);

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
  difficulty: null,
  status: null
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

const learningPlan = reactive({
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
      const diff = parseInt(technique.difficulty);
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
  } catch (error) {
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

function formatDifficulty(difficulty) {
  switch (difficulty) {
    case 'easy': return 'Easy';
    case 'moderate': return 'Moderate';
    case 'challenging': return 'Challenging';
    default: return difficulty;
  }
}

function formatGearType(type) {
  const typeMap = {
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

function getMediaIcon(type) {
  switch (type) {
    case 'youtube': return 'videocam';
    case 'image': return 'image';
    case 'audio': return 'audiotrack';
    default: return 'link';
  }
}

function getMediaColor(type) {
  switch (type) {
    case 'youtube': return 'red';
    case 'image': return 'green';
    case 'audio': return 'blue';
    default: return 'grey';
  }
}

function getTechniqueColor(technique) {
  // If technique is mastered, show green
  if (technique.progress && technique.progress.status === 'Mastered') {
    return 'positive';
  }

  // Otherwise color based on difficulty
  return getDifficultyColor(technique.difficulty);
}

function getDifficultyColor(level) {
  switch (parseInt(level)) {
    case 1: return 'green';
    case 2: return 'light-green';
    case 3: return 'amber';
    case 4: return 'orange';
    case 5: return 'red';
    default: return 'grey';
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

function formatProgressStatus(status) {
  switch (status) {
    case 'NotStarted': return 'Not Started';
    case 'InProgress': return 'In Progress';
    case 'Mastered': return 'Mastered';
    default: return status;
  }
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function editArtist() {
  // In a real app, this would open the edit form or navigate to an edit page
  // For now, we'll just show a notification
  $q.notify({
    color: 'info',
    position: 'top',
    message: 'Edit artist: ' + artist.value.name,
    icon: 'edit'
  });
}

async function updateProgress(techniqueId, status) {
  try {
    await progressStore.updateTechniqueProgress(techniqueId, { status });

    // Update the technique in our local artist object
    const technique = artist.value.techniques.find(t => t.id === techniqueId);
    if (technique) {
      technique.progress = { ...technique.progress || {}, status };
    }

    $q.notify({
      color: 'positive',
      position: 'top',
      message: `Progress updated to ${formatProgressStatus(status)}`,
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

function addToLearningPlan(technique) {
  selectedTechnique.value = technique;
  learningPlan.technique_id = technique.id;
  learningPlan.target_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    .toISOString()
    .split('T')[0]; // Set default date to 2 weeks from now
  learningPlan.notes = '';
  learningPlan.priority = 'medium';
  planDialog.value = true;
}

async function saveLearningPlan() {
  try {
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
