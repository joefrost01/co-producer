<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Learning Progress</h1>
    </div>

    <q-separator class="q-mb-md" />

    <div v-if="loading" class="row justify-center items-center" style="height: 200px">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <!-- Progress Overview -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Progress Overview</div>

            <div class="text-center q-py-md">
              <q-circular-progress
                show-value
                :value="overallProgress"
                size="180px"
                :thickness="0.2"
                color="primary"
                track-color="grey-3"
                class="q-mb-lg"
              >
                <div class="text-h5">{{ Math.round(overallProgress) }}%</div>
                <div class="text-caption">Mastered</div>
              </q-circular-progress>
            </div>

            <q-list separator>
              <q-item>
                <q-item-section>
                  <q-item-label>Total Techniques</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold">{{ stats.total }}</div>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-icon name="check_circle" color="positive" size="xs" class="q-mr-xs" />
                    Mastered
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold">{{ stats.mastered }}</div>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-icon name="trending_up" color="blue" size="xs" class="q-mr-xs" />
                    In Progress
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold">{{ stats.inProgress }}</div>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-icon name="schedule" color="grey" size="xs" class="q-mr-xs" />
                    Not Started
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold">{{ stats.notStarted }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Difficulty Breakdown</div>

            <div class="row items-center q-mb-md" v-for="(count, level) in difficultyStats" :key="level">
              <div class="col-4">
                <div class="text-subtitle2">Level {{ level }}</div>
              </div>
              <div class="col-6">
                <q-linear-progress
                  :value="count / stats.total"
                  :color="getDifficultyColor(level)"
                  size="20px"
                  class="rounded-borders"
                />
              </div>
              <div class="col-2 text-right">
                <div class="text-subtitle2">{{ count }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Technique List -->
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">Techniques</div>

              <div class="row q-gutter-sm">
                <q-input
                  v-model="search"
                  placeholder="Search techniques"
                  dense
                  outlined
                  class="q-mr-sm"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-select
                  v-model="statusFilter"
                  :options="statusOptions"
                  label="Status"
                  dense
                  outlined
                  emit-value
                  map-options
                  style="min-width: 150px"
                />
              </div>
            </div>

            <q-table
              :rows="filteredTechniques"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="{ rowsPerPage: 10 }"
              separator="cell"
              flat
              :filter="search"
            >
              <template v-slot:loading>
                <q-inner-loading showing>
                  <q-spinner size="50px" color="primary" />
                </q-inner-loading>
              </template>

              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <div class="text-weight-medium">{{ props.row.name }}</div>
                  <div class="text-caption text-grey">{{ props.row.artist_name }}</div>
                </q-td>
              </template>

              <template v-slot:body-cell-difficulty="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <q-rating
                      v-model="props.row.difficulty"
                      max="5"
                      size="xs"
                      readonly
                      :color="getDifficultyColor(props.row.difficulty)"
                    />
                    <span class="text-caption q-ml-sm">
                      {{ props.row.difficulty }}/5
                    </span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-progress="props">
                <q-td :props="props">
                  <q-badge
                    v-if="props.row.progress"
                    :color="getProgressColor(props.row.progress.status)"
                    text-color="white"
                  >
                    {{ formatProgressStatus(props.row.progress.status) }}
                  </q-badge>
                  <q-badge v-else color="grey" text-color="white">
                    Not Set
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                  <q-btn-dropdown flat dense color="primary" label="Update Status">
                    <q-list>
                      <q-item
                        clickable
                        v-close-popup
                        @click="updateProgress(props.row.id, 'NotStarted')"
                      >
                        <q-item-section avatar>
                          <q-icon name="schedule" color="grey" />
                        </q-item-section>
                        <q-item-section>Not Started</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        @click="updateProgress(props.row.id, 'InProgress')"
                      >
                        <q-item-section avatar>
                          <q-icon name="trending_up" color="blue" />
                        </q-item-section>
                        <q-item-section>In Progress</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        @click="updateProgress(props.row.id, 'Mastered')"
                      >
                        <q-item-section avatar>
                          <q-icon name="check_circle" color="positive" />
                        </q-item-section>
                        <q-item-section>Mastered</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>

                  <q-btn
                    flat
                    round
                    color="grey"
                    icon="more_vert"
                  >
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="viewTechniqueDetails(props.row)">
                          <q-item-section avatar>
                            <q-icon name="visibility" />
                          </q-item-section>
                          <q-item-section>View Details</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="addToLearningPlan(props.row)">
                          <q-item-section avatar>
                            <q-icon name="playlist_add" />
                          </q-item-section>
                          <q-item-section>Add to Learning Plan</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Recent Progress</div>

            <div v-if="recentUpdates.length === 0" class="text-center q-pa-md">
              <p class="text-body1">No recent progress updates.</p>
            </div>

            <q-timeline v-else color="secondary">
              <q-timeline-entry
                v-for="update in recentUpdates"
                :key="update.id"
                :title="update.title"
                :subtitle="formatDate(update.timestamp)"
                :icon="update.icon"
                :color="update.color"
              >
                <div>{{ update.description }}</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Technique Detail Dialog -->
    <q-dialog v-model="detailDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedTechnique?.name || '' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md">Artist:</div>
            <div>{{ selectedTechnique?.artist_name || '' }}</div>
          </div>

          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md">Difficulty:</div>
            <template v-if="selectedTechnique">
              <q-rating
                :model-value="selectedTechnique.difficulty"
                max="5"
                size="xs"
                readonly
                :color="getDifficultyColor(selectedTechnique.difficulty || 0)"
              />
              <span class="text-caption q-ml-sm">
                {{ selectedTechnique.difficulty || 0 }}/5
              </span>
            </template>
            <template v-else>
              <q-rating
                :model-value="0"
                max="5"
                size="xs"
                readonly
                color="grey"
              />
              <span class="text-caption q-ml-sm">
                0/5
              </span>
            </template>
          </div>

          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 q-mr-md">Status:</div>
            <q-badge
              v-if="selectedTechnique?.progress"
              :color="getProgressColor(selectedTechnique.progress.status)"
              text-color="white"
            >
              {{ formatProgressStatus(selectedTechnique.progress.status) }}
            </q-badge>
            <q-badge v-else color="grey" text-color="white">
              Not Set
            </q-badge>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Description:</div>
            <p>{{ selectedTechnique?.description || '' }}</p>
          </div>

          <div v-if="selectedTechnique?.tab_notation" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Tab Notation:</div>
            <pre class="tab-notation">{{ selectedTechnique.tab_notation }}</pre>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Instructions:</div>
            <p>{{ selectedTechnique?.instructions || '' }}</p>
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

          <q-btn flat label="Close" v-close-popup />
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
          <p class="q-mb-md">Add "<strong>{{ selectedTechnique?.name || '' }}</strong>" to your learning plan.</p>

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
              :options="['low', 'medium', 'high']"
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
                      :name="scope.opt === 'high' ? 'priority_high' : (scope.opt === 'medium' ? 'drag_handle' : 'arrow_downward')"
                      :color="scope.opt === 'high' ? 'negative' : (scope.opt === 'medium' ? 'warning' : 'positive')"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.charAt(0).toUpperCase() + scope.opt.slice(1) }}</q-item-label>
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
import { useQuasar } from 'quasar';
import { useTechniqueStore } from 'src/stores/technique-store';
import { useProgressStore } from 'src/stores/progress-store';
import { Technique } from 'src/models/technique';
import { ProgressStatus } from 'src/models/progress';
import { ColumnDefinition } from 'src/models/common';

const $q = useQuasar();
const techniqueStore = useTechniqueStore();
const progressStore = useProgressStore();

const loading = ref(true);
const search = ref('');
const statusFilter = ref('all');
const detailDialog = ref(false);
const planDialog = ref(false);
// Add proper typing to selectedTechnique
const selectedTechnique = ref<Technique | null>(null);

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Mastered', value: 'Mastered' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Not Started', value: 'NotStarted' }
];

// Add proper typing to the columns array
const columns: ColumnDefinition[] = [
  {
    name: 'name',
    required: true,
    label: 'Technique',
    align: 'left',
    field: (row: Record<string, unknown>) => {
      // Use the index signature to access properties safely
      return row.name as string;
    },
    sortable: true
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    field: 'difficulty',
    sortable: true
  },
  {
    name: 'progress',
    label: 'Status',
    field: (row: Record<string, unknown>) => {
      const progress = row.progress as Record<string, unknown> | undefined;
      return (progress?.status as string) || 'NotStarted';
    },
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'right'
  }
];

// Define a proper interface for the learning plan
interface LearningPlanForm {
  technique_id: string;
  target_date: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
}

const learningPlan = reactive<LearningPlanForm>({
  technique_id: '',
  target_date: '',
  notes: '',
  priority: 'medium'
});

// Fix the filteredTechniques computed property to handle optional progress property
const filteredTechniques = computed(() => {
  return techniqueStore.techniques.filter(technique => {
    if (statusFilter.value !== 'all' && technique.progress?.status !== statusFilter.value) {
      return false;
    }
    return true;
  });
});

// Fix the stats computed property to handle optional progress property
const stats = computed(() => {
  const techniques = techniqueStore.techniques;
  return {
    total: techniques.length,
    mastered: techniques.filter(t => t.progress?.status === 'Mastered').length,
    inProgress: techniques.filter(t => t.progress?.status === 'InProgress').length,
    notStarted: techniques.filter(t => t.progress?.status === 'NotStarted').length
  };
});

const overallProgress = computed(() => {
  if (stats.value.total === 0) return 0;
  return (stats.value.mastered / stats.value.total) * 100;
});

// Fix the difficultyStats computed property
const difficultyStats = computed(() => {
  // Create an indexed type to fix the indexing issues
  const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  techniqueStore.techniques.forEach(technique => {
    // Make sure difficulty is a number and is a valid index
    const difficulty = Number(technique.difficulty);
    if (difficulty >= 1 && difficulty <= 5) {
      result[difficulty] = (result[difficulty] || 0) + 1;
    }
  });
  return result;
});

// Add proper typing to recentUpdates
interface UpdateItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

const recentUpdates = ref<UpdateItem[]>([
  {
    id: 1,
    title: 'Status Updated',
    description: 'Chord Progression IV-V-I mastered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    icon: 'check_circle',
    color: 'positive'
  },
  {
    id: 2,
    title: 'Started Learning',
    description: 'Began practicing Finger Tapping technique',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    icon: 'trending_up',
    color: 'blue'
  }
]);

onMounted(async () => {
  try {
    await techniqueStore.fetchTechniques();
    await progressStore.fetchProgress();
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load techniques and progress data',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

// Fix the methods by adding proper type annotations
function formatProgressStatus(status: string): string {
  switch (status) {
    case 'NotStarted': return 'Not Started';
    case 'InProgress': return 'In Progress';
    case 'Mastered': return 'Mastered';
    default: return status;
  }
}

function getProgressColor(status: string): string {
  switch (status) {
    case 'NotStarted': return 'grey';
    case 'InProgress': return 'blue';
    case 'Mastered': return 'positive';
    default: return 'grey';
  }
}

function getDifficultyColor(level: string | number): string {
  switch (parseInt(level as string)) {
    case 1: return 'green';
    case 2: return 'light-green';
    case 3: return 'amber';
    case 4: return 'orange';
    case 5: return 'red';
    default: return 'grey';
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function updateProgress(id: string, status: string): Promise<void> {
  try {
    await progressStore.updateTechniqueProgress(id, { status });

    $q.notify({
      color: 'positive',
      position: 'top',
      message: `Technique status updated to ${formatProgressStatus(status)}`,
      icon: 'check'
    });

    // Update the selected technique if it's the one being viewed
    if (selectedTechnique.value && selectedTechnique.value.id === id) {
      if (!selectedTechnique.value.progress) {
        selectedTechnique.value.progress = { status };
      } else {
        selectedTechnique.value.progress.status = status;
      }
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to update technique status',
      icon: 'report_problem'
    });
  }
}

function viewTechniqueDetails(technique: Technique): void {
  selectedTechnique.value = { ...technique };
  detailDialog.value = true;
}

function addToLearningPlan(technique: Technique): void {
  selectedTechnique.value = { ...technique };
  learningPlan.technique_id = technique.id;
  const targetDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const dateStr = targetDate.toISOString().split('T')[0];
  if (dateStr) {
    learningPlan.target_date = dateStr; // Set default date to 2 weeks from now
  }
  planDialog.value = true;
}

async function saveLearningPlan(): Promise<void> {
  try {
    // This would be implemented with a real API call
    // await learningPlanStore.addTechniqueToLearningPlan(learningPlan);

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

<style lang="scss">
.tab-notation {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
}
</style>
