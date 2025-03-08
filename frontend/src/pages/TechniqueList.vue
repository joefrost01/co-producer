<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Techniques</h1>
      <q-btn
        color="primary"
        icon="add"
        label="Add Technique"
        @click="openAddDialog"
        unelevated
      />
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <!-- Technique filters -->
      <div class="col-12 col-md-3">
        <FilterPanel @reset="resetFilters">
          <template v-slot:filters>
            <q-input
              v-model="filters.search"
              label="Search"
              outlined
              dense
              clearable
              debounce="300"
              class="q-mb-md"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              v-model="filters.artist"
              :options="artistOptions"
              label="Artist"
              outlined
              dense
              emit-value
              map-options
              clearable
              class="q-mb-md"
            />

            <q-select
              v-model="filters.difficulty"
              :options="difficultyOptions"
              label="Difficulty"
              outlined
              dense
              emit-value
              map-options
              clearable
              class="q-mb-md"
            />

            <q-select
              v-model="filters.status"
              :options="statusOptions"
              label="Status"
              outlined
              dense
              emit-value
              map-options
              clearable
              class="q-mb-md"
            />
          </template>
        </FilterPanel>
      </div>

      <!-- Technique grid -->
      <div class="col-12 col-md-9">
        <div v-if="loading" class="flex justify-center items-center" style="min-height: 200px">
          <q-spinner size="40px" color="primary" />
        </div>

        <div v-else-if="filteredTechniques.length === 0" class="text-center q-pa-xl">
          <q-icon name="piano" size="60px" color="grey-5" />
          <p class="text-h6 q-mt-md">No techniques found</p>
          <p class="text-body1">Try adjusting your filters or add a new technique.</p>
          <q-btn color="primary" label="Add Technique" icon="add" unelevated @click="openAddDialog" class="q-mt-sm" />
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div v-for="technique in filteredTechniques" :key="technique.id" class="col-12 col-sm-6 col-md-4">
              <EntityCard>
                <template v-slot:header>
                  <div class="row items-center no-wrap">
                    <q-avatar :color="getDifficultyColor(technique.difficulty)" text-color="white" size="50px">
                      {{ technique.difficulty }}
                    </q-avatar>

                    <div class="q-ml-md">
                      <div class="text-h6 text-no-wrap">{{ technique.name }}</div>
                      <div class="text-subtitle2">{{ technique.artist_name }}</div>
                    </div>
                  </div>
                </template>

                <template v-slot:content>
                  <div class="q-mb-sm">
                    <StatusBadge :status="technique.progress?.status || 'NotStarted'" />
                  </div>

                  <div class="q-mt-sm">
                    <p class="ellipsis-3-lines">{{ technique.description }}</p>
                  </div>
                </template>

                <template v-slot:actions>
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

                  <q-btn flat round color="grey" icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="viewTechniqueDetails(technique)">
                          <q-item-section avatar>
                            <q-icon name="visibility" />
                          </q-item-section>
                          <q-item-section>View Details</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="editTechnique(technique)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>Edit</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="addToLearningPlan(technique)">
                          <q-item-section avatar>
                            <q-icon name="playlist_add" />
                          </q-item-section>
                          <q-item-section>Add to Learning Plan</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="confirmDeleteTechnique(technique)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>Delete</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </template>
              </EntityCard>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Technique Dialog -->
    <q-dialog v-model="techniqueDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit Technique' : 'Add New Technique' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md" style="max-height: 80vh" scroll>
          <q-form @submit="saveTechnique" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="editedTechnique.artist_id"
                  :options="artistOptions"
                  label="Artist *"
                  outlined
                  :rules="[val => !!val || 'Artist is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="editedTechnique.name"
                  label="Technique Name *"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>

              <div class="col-12">
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-12 col-md-4">
                    <div class="text-subtitle1 q-mb-sm">Difficulty Level *</div>
                  </div>
                  <div class="col-12 col-md-8">
                    <q-slider
                      v-model="editedTechnique.difficulty"
                      :min="1"
                      :max="5"
                      :step="1"
                      label
                      label-always
                      markers
                      marker-labels
                      marker-labels-class="custom-marker-labels"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12">
                <q-input
                  v-model="editedTechnique.description"
                  type="textarea"
                  label="Description *"
                  outlined
                  rows="3"
                  :rules="[val => !!val || 'Description is required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="editedTechnique.instructions"
                  type="textarea"
                  label="Instructions *"
                  outlined
                  rows="3"
                  :rules="[val => !!val || 'Instructions are required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="editedTechnique.tab_notation"
                  type="textarea"
                  label="Tab Notation"
                  outlined
                  rows="6"
                  class="font-monospace"
                  hint="Use ASCII tab notation for examples"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-xl">
              <q-btn flat label="Cancel" color="grey" v-close-popup class="q-mr-sm" />
              <q-btn unelevated label="Save" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Technique Detail Dialog -->
    <q-dialog v-model="detailDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedTechnique?.name }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md">Artist:</div>
            <div>{{ selectedTechnique?.artist_name }}</div>
          </div>

          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md">Difficulty:</div>
            <q-rating
              :model-value="selectedTechnique?.difficulty || 0"
              max="5"
              size="xs"
              readonly
              color="amber"
            />
            <span class="text-caption q-ml-sm">
              {{ selectedTechnique?.difficulty }}/5
            </span>
          </div>

          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md">Status:</div>
            <StatusBadge :status="selectedTechnique?.progress?.status || 'NotStarted'" />
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Description:</div>
            <p>{{ selectedTechnique?.description }}</p>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Instructions:</div>
            <p>{{ selectedTechnique?.instructions }}</p>
          </div>

          <div v-if="selectedTechnique?.tab_notation" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Tab Notation:</div>
            <pre class="tab-notation">{{ selectedTechnique?.tab_notation }}</pre>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn-dropdown flat color="primary" label="Update Status">
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="selectedTechnique?.id && updateProgress(selectedTechnique.id, 'NotStarted')"
              >
                <q-item-section avatar>
                  <q-icon name="schedule" color="grey" />
                </q-item-section>
                <q-item-section>Not Started</q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="selectedTechnique?.id && updateProgress(selectedTechnique.id, 'InProgress')"
              >
                <q-item-section avatar>
                  <q-icon name="trending_up" color="blue" />
                </q-item-section>
                <q-item-section>In Progress</q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="selectedTechnique?.id && updateProgress(selectedTechnique.id, 'Mastered')"
              >
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>Mastered</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn flat color="secondary" icon="playlist_add" label="Add to Learning Plan" @click="selectedTechnique && addToLearningPlan(selectedTechnique)" />
          <q-btn flat color="primary" icon="edit" label="Edit" @click="selectedTechnique && editTechnique(selectedTechnique)" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

    <!-- Delete confirmation dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Delete technique "{{ techniqueToDelete?.name }}"?</span>
        </q-card-section>

        <q-card-section>
          This action cannot be undone. The technique will be permanently deleted.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteTechnique" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useTechniqueStore } from 'src/stores/technique-store';
import { useArtistStore } from 'src/stores/artist-store';
import { useProgressStore } from 'src/stores/progress-store';
import { useConfirmation } from 'src/composables/useConfirmation';
// Import utility function but use our local version to handle undefined properly
// import { getDifficultyColor } from 'src/lib/utils';
import { Technique } from 'src/models/technique';
import { ProgressStatus } from 'src/models/progress';
import FilterPanel from 'src/components/common/FilterPanel.vue';
import EntityCard from 'src/components/common/EntityCard.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import { getDifficultyColor } from 'src/lib/utils'

// Define interfaces for our data types
interface LearningPlanData {
  technique_id: string;
  target_date: string;
  notes: string;
  priority: string;
}

const $q = useQuasar();
const router = useRouter();
const techniqueStore = useTechniqueStore();
const artistStore = useArtistStore();
const progressStore = useProgressStore();
const { confirm } = useConfirmation<Technique>();

const loading = ref(true);
const techniqueDialog = ref(false);
const detailDialog = ref(false);
const planDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const techniqueToDelete = ref<Technique | null>(null);
const selectedTechnique = ref<Technique | null>(null);

// Filters
const filters = reactive({
  search: '',
  artist: null as string | null,
  difficulty: null as string | null,
  status: null as string | null
});

// Form state
const editedTechnique = ref<Technique>({
  id: '',
  artist_id: '',
  artist_name: '',
  name: '',
  description: '',
  difficulty: 3,
  tab_notation: '',
  instructions: '',
  progress: { status: 'NotStarted' }
});

const learningPlan = reactive<LearningPlanData>({
  technique_id: '',
  target_date: '',
  notes: '',
  priority: 'medium'
});

// Options for filters and form selects
const artistOptions = computed(() => {
  return artistStore.artists.map(artist => ({
    label: artist.name,
    value: artist.id
  }));
});

const difficultyOptions = computed(() => [
  { label: 'Beginner (1-2)', value: 'beginner' },
  { label: 'Intermediate (3)', value: 'intermediate' },
  { label: 'Advanced (4-5)', value: 'advanced' }
]);

const statusOptions = computed(() => [
  { label: 'Not Started', value: 'NotStarted' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Mastered', value: 'Mastered' }
]);

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

// We'll use CSS classes instead of dynamic binding for marker labels
// This avoids the TypeScript issue completely

// Filtered techniques based on selected filters
const filteredTechniques = computed(() => {
  return techniqueStore.techniques.filter(technique => {
    // Search filter
    if (filters.search && !technique.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !technique.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Artist filter
    if (filters.artist && technique.artist_id !== filters.artist) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty) {
      const diff = parseInt(String(technique.difficulty));
      if (filters.difficulty === 'beginner' && (diff > 2)) return false;
      if (filters.difficulty === 'intermediate' && diff !== 3) return false;
      if (filters.difficulty === 'advanced' && (diff < 4)) return false;
    }

    // Status filter
    if (filters.status && (!technique.progress || technique.progress.status !== filters.status)) {
      return false;
    }

    return true;
  });
});

onMounted(async () => {
  try {
    await Promise.all([
      techniqueStore.fetchTechniques(),
      artistStore.fetchArtists(),
      progressStore.fetchProgress()
    ]);
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load techniques',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

function resetFilters() {
  filters.search = '';
  filters.artist = null;
  filters.difficulty = null;
  filters.status = null;
}

function openAddDialog() {
  isEditing.value = false;
  editedTechnique.value = {
    id: '',
    artist_id: '',
    artist_name: '',
    name: '',
    description: '',
    difficulty: 3,
    tab_notation: '',
    instructions: '',
    progress: { status: 'NotStarted' }
  };
  techniqueDialog.value = true;
}

function editTechnique(technique: Technique) {
  isEditing.value = true;
  editedTechnique.value = JSON.parse(JSON.stringify(technique)); // Deep copy
  techniqueDialog.value = true;
}

function viewTechniqueDetails(technique: Technique) {
  selectedTechnique.value = { ...technique };
  detailDialog.value = true;
}

function confirmDeleteTechnique(technique: Technique) {
  techniqueToDelete.value = technique;
  deleteDialog.value = true;
}

async function deleteTechnique() {
  if (!techniqueToDelete.value) return;

  try {
    if (techniqueToDelete.value.artist_id && techniqueToDelete.value.id) {
      await artistStore.deleteTechnique(techniqueToDelete.value.artist_id, techniqueToDelete.value.id);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Technique deleted successfully',
        icon: 'check'
      });
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to delete technique',
      icon: 'report_problem'
    });
  }
}

async function saveTechnique() {
  try {
    if (isEditing.value) {
      await artistStore.updateTechnique(editedTechnique.value.artist_id, editedTechnique.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Technique updated successfully',
        icon: 'check'
      });
    } else {
      await artistStore.addTechniqueToArtist(editedTechnique.value.artist_id, editedTechnique.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Technique created successfully',
        icon: 'check'
      });
    }
    techniqueDialog.value = false;
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: isEditing.value ? 'Failed to update technique' : 'Failed to create technique',
      icon: 'report_problem'
    });
  }
}

function addToLearningPlan(technique: Technique) {
  selectedTechnique.value = technique;
  learningPlan.technique_id = technique.id;

  // Fix for TypeScript error #3 - ensure target_date is a string
  const twoWeeksFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const dateStr = twoWeeksFromNow.toISOString().split('T')[0];
  // Type assertion to ensure TypeScript knows this is a string
  learningPlan.target_date = dateStr as string;

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

async function updateProgress(techniqueId: string, status: string) {
  try {
    await progressStore.updateTechniqueProgress(techniqueId, { status });

    $q.notify({
      color: 'positive',
      position: 'top',
      message: `Progress updated to ${formatProgressStatus(status)}`,
      icon: 'check'
    });

    // Update the selected technique if it's the one being viewed
    if (selectedTechnique.value && selectedTechnique.value.id === techniqueId) {
      if (!selectedTechnique.value.progress) {
        selectedTechnique.value.progress = { status: 'NotStarted' };
      }
      selectedTechnique.value.progress.status = status;
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to update progress',
      icon: 'report_problem'
    });
  }
}

function formatProgressStatus(status: string | undefined) {
  if (!status) return 'Unknown';

  switch (status) {
    case 'NotStarted': return 'Not Started';
    case 'InProgress': return 'In Progress';
    case 'Mastered': return 'Mastered';
    default: return status;
  }
}

function getProgressColor(status: string | undefined) {
  if (!status) return 'grey';

  switch (status) {
    case 'NotStarted': return 'grey';
    case 'InProgress': return 'blue';
    case 'Mastered': return 'positive';
    default: return 'grey';
  }
}
</script>

<style lang="scss">
.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-notation {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
}

.font-monospace {
  font-family: monospace;
}

/* Custom marker labels for difficulty slider */
.custom-marker-labels {
  &[data-v-marker="1"] {
    color: var(--q-green);
  }
  &[data-v-marker="2"] {
    color: var(--q-light-green);
  }
  &[data-v-marker="3"] {
    color: var(--q-amber);
  }
  &[data-v-marker="4"] {
    color: var(--q-orange);
  }
  &[data-v-marker="5"] {
    color: var(--q-red);
  }
}
</style>
