<template>
  <q-page padding>
    <div v-if="loading">
      <div class="row justify-center items-center" style="height: 400px">
        <q-spinner color="primary" size="3em" />
      </div>
    </div>

    <div v-else>
      <!-- Technique header -->
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="row items-center">
            <h1 class="text-h4 q-my-none">{{ technique.name }}</h1>
            <q-badge
              :color="getProgressColor(technique.progress?.status || 'NotStarted')"
              text-color="white"
              class="q-ml-md"
            >
              {{ formatProgressStatus(technique.progress?.status || 'NotStarted') }}
            </q-badge>
          </div>
          <div class="text-subtitle1 q-mt-sm text-grey-8 row items-center">
            <q-avatar
              size="24px"
              color="primary"
              text-color="white"
              class="q-mr-sm"
            >
              {{ artistName.charAt(0) }}
            </q-avatar>
            {{ artistName }} • Difficulty: {{ technique.difficulty }}/5
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            outline
            color="primary"
            icon="edit"
            label="Edit"
            @click="editTechnique"
          />
          <q-btn-dropdown
            color="secondary"
            icon="trending_up"
            label="Update Status"
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="updateProgress('NotStarted')"
              >
                <q-item-section avatar>
                  <q-icon name="schedule" color="grey" />
                </q-item-section>
                <q-item-section>Not Started</q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="updateProgress('InProgress')"
              >
                <q-item-section avatar>
                  <q-icon name="trending_up" color="blue" />
                </q-item-section>
                <q-item-section>In Progress</q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="updateProgress('Mastered')"
              >
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>Mastered</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Technique content -->
      <div class="row q-col-gutter-md">
        <!-- Technique details -->
        <div class="col-12 col-md-5">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">About this Technique</div>
              <p>{{ technique.description }}</p>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Instructions</div>
              <p>{{ technique.instructions }}</p>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Difficulty</div>
              <div class="row items-center">
                <q-rating
                  v-model="difficulty"
                  max="5"
                  size="1.5em"
                  :color="getDifficultyColor(technique.difficulty)"
                  icon="star"
                  readonly
                />
                <span class="q-ml-sm">{{ technique.difficulty }}/5</span>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Learning Progress</div>

              <div v-if="technique.progress" class="q-mt-md">
                <div class="row items-center q-mb-md">
                  <div class="text-subtitle2 q-mr-md">Current Status:</div>
                  <q-badge :color="getProgressColor(technique.progress.status)" text-color="white">
                    {{ formatProgressStatus(technique.progress.status) }}
                  </q-badge>
                </div>

                <div v-if="technique.progress?.notes" class="q-mb-md">
                  <div class="text-subtitle2">Notes:</div>
                  <p>{{ technique.progress.notes }}</p>
                </div>

                <div v-if="technique.progress?.started_at" class="q-mb-md">
                  <div class="text-subtitle2">Started:</div>
                  <p>{{ formatDate(technique.progress.started_at) }}</p>
                </div>

                <div v-if="technique.progress?.completed_at" class="q-mb-md">
                  <div class="text-subtitle2">Mastered:</div>
                  <p>{{ formatDate(technique.progress.completed_at) }}</p>
                </div>

                <q-btn
                  color="secondary"
                  icon="playlist_add"
                  label="Add to Learning Plan"
                  @click="addToLearningPlan"
                  class="q-mt-md"
                  unelevated
                />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Artist Information</div>

              <q-item clickable :to="`/artists/${technique.artist_id}`" class="q-px-none">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ artistName.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ artistName }}</q-item-label>
                  <q-item-label caption>{{ artistInfo.instrument }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Other Techniques by this Artist</div>

              <q-list separator>
                <template v-for="relatedTech in relatedTechniques" :key="relatedTech.id">
                  <q-item
                    v-if="relatedTech.id !== technique.id"
                    clickable
                    :to="`/techniques/${relatedTech.id}`"
                  >
                    <q-item-section avatar>
                      <q-avatar :color="getDifficultyColor(relatedTech.difficulty)" text-color="white">
                        {{ relatedTech.difficulty }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ relatedTech.name }}</q-item-label>
                      <q-item-label caption lines="1">
                        {{ truncateText(relatedTech.description, 60) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge :color="getProgressColor(relatedTech.progress?.status || 'NotStarted')">
                        {{ formatProgressStatus(relatedTech.progress?.status || 'NotStarted') }}
                      </q-badge>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>

              <div v-if="relatedTechniques.length <= 1" class="text-center q-pa-md">
                <p class="text-body1">No other techniques available for this artist.</p>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tab notation and practice resources -->
        <div class="col-12 col-md-7">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Tab Notation</div>

              <div v-if="technique.tab_notation" class="q-mt-md">
                <pre class="tab-notation">{{ technique.tab_notation }}</pre>
              </div>

              <div v-else class="text-center q-py-xl">
                <q-icon name="music_note" size="48px" color="grey-5" />
                <p class="text-h6 q-mt-md">No Tab Notation</p>
                <p class="text-body1">No tab notation has been provided for this technique.</p>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Practice Resources</div>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-md-6">
                  <q-card bordered class="practice-card">
                    <q-card-section class="text-center">
                      <q-icon name="slow_motion_video" size="48px" color="amber" />
                      <div class="text-h6 q-mt-sm">Practice Slowly</div>
                      <p class="q-mt-sm">Start at a slow tempo and gradually increase speed as you master the technique.</p>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card bordered class="practice-card">
                    <q-card-section class="text-center">
                      <q-icon name="repeat" size="48px" color="teal" />
                      <div class="text-h6 q-mt-sm">Practice Regularly</div>
                      <p class="q-mt-sm">Consistent practice in shorter sessions is more effective than occasional long sessions.</p>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card bordered class="practice-card">
                    <q-card-section class="text-center">
                      <q-icon name="record_voice_over" size="48px" color="purple" />
                      <div class="text-h6 q-mt-sm">Record Yourself</div>
                      <p class="q-mt-sm">Recording and listening to your practice sessions helps identify areas for improvement.</p>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card bordered class="practice-card">
                    <q-card-section class="text-center">
                      <q-icon name="music_note" size="48px" color="deep-orange" />
                      <div class="text-h6 q-mt-sm">Apply Musically</div>
                      <p class="q-mt-sm">Practice the technique in the context of real songs to develop musical application.</p>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Similar Techniques</div>

              <q-list separator>
                <q-item
                  v-for="similarTechnique in similarTechniques"
                  :key="similarTechnique.id"
                  clickable
                  :to="`/techniques/${similarTechnique.id}`"
                >
                  <q-item-section avatar>
                    <q-avatar :color="getDifficultyColor(similarTechnique.difficulty)" text-color="white">
                      {{ similarTechnique.difficulty }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ similarTechnique.name }}</q-item-label>
                    <q-item-label caption>{{ similarTechnique.artist_name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="getProgressColor(similarTechnique.progress?.status || 'NotStarted')">
                      {{ formatProgressStatus(similarTechnique.progress?.status || 'NotStarted') }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="similarTechniques.length === 0" class="text-center q-pa-md">
                <p class="text-body1">No similar techniques found.</p>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Edit Technique Dialog -->
    <q-dialog v-model="editDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Edit Technique</div>
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
          <p class="q-mb-md">Add "<strong>{{ technique.name }}</strong>" to your learning plan.</p>

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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useTechniqueStore } from 'src/stores/technique-store';
import { useArtistStore } from 'src/stores/artist-store';
import { useProgressStore } from 'src/stores/progress-store';
import type { Technique } from 'src/models/technique';
import { resolve } from 'node:url'

// LearningPlanInput interface
interface LearningPlanInput {
  technique_id: string;
  target_date: string;
  notes: string;
  priority: string;
}

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const techniqueStore = useTechniqueStore();
const artistStore = useArtistStore();
const progressStore = useProgressStore();

const loading = ref(true);
const editDialog = ref(false);
const planDialog = ref(false);

// Properly typed technique ref
const technique = ref<Technique>({
  id: '',
  artist_id: '',
  name: '',
  description: '',
  difficulty: 3,
  tab_notation: '',
  instructions: '',
  progress: {
    status: 'NotStarted'
  }
});

// Difficulty rating conversion
const difficulty = computed(() => {
  return technique.value.difficulty;
});

// Form state for editing - properly typed
const editedTechnique = ref<Technique>({
  id: '',
  artist_id: '',
  name: '',
  description: '',
  difficulty: 3,
  tab_notation: '',
  instructions: '',
  progress: {
    status: 'NotStarted'
  }
});

// Learning plan with proper typing
const learningPlan = reactive<LearningPlanInput>({
  technique_id: '',
  target_date: '',
  notes: '',
  priority: 'medium'
});

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

// Artist information
const artistInfo = computed(() => {
  return artistStore.getArtistById(technique.value.artist_id) || { name: 'Unknown Artist', instrument: 'Unknown' };
});

const artistName = computed(() => {
  return artistInfo.value.name;
});

// Artist options for dropdown
const artistOptions = computed(() => {
  return artistStore.artists.map(artist => ({
    label: artist.name,
    value: artist.id
  }));
});

// Related techniques by the same artist
const relatedTechniques = computed(() => {
  const artistTechniques = techniqueStore.techniques.filter(t => t.artist_id === technique.value.artist_id);
  return artistTechniques;
});

// Similar techniques (same difficulty level)
const similarTechniques = computed(() => {
  // Get techniques with the same difficulty level but different artist
  return techniqueStore.techniques
    .filter(t =>
      t.difficulty === technique.value.difficulty &&
      t.id !== technique.value.id &&
      t.artist_id !== technique.value.artist_id
    )
    .slice(0, 5); // Limit to 5 similar techniques
});

// Watch for route changes to load the correct technique
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      void loadTechnique(newId as string);
    }
  }
);

onMounted(async () => {
  try {
    // Load related data
    await Promise.all([
      techniqueStore.fetchTechniques(),
      artistStore.fetchArtists(),
      progressStore.fetchProgress()
    ]);

    // Load the current technique
    if (route.params.id) {
      await loadTechnique(route.params.id as string);
    }
  } catch (_err) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load technique',
      icon: 'report_problem'
    });
    loading.value = false;
  }
});

async function loadTechnique(id: string): Promise<void> {
  loading.value = true;
  try {
    const techniqueData = techniqueStore.getTechniqueById(id);

    if (!techniqueData) {
      throw new Error('Technique not found');
    }

    technique.value = { ...techniqueData };
  } catch (err) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load technique',
      icon: 'report_problem'
    });
    void router.push('/techniques');
    resolve();
  } finally {
    loading.value = false;
  }
}

function editTechnique(): void {
  editedTechnique.value = JSON.parse(JSON.stringify(technique.value)); // Deep copy
  editDialog.value = true;
}

async function saveTechnique(): Promise<void> {
  try {
    await artistStore.updateTechnique(editedTechnique.value.artist_id, editedTechnique.value);

    // Reload the technique after update
    if (editedTechnique.value.artist_id !== technique.value.artist_id) {
      // Artist changed, need to navigate to the updated URL
      void router.push(`/techniques/${editedTechnique.value.id}`);
    } else {
      await loadTechnique(editedTechnique.value.id);
    }

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Technique updated successfully',
      icon: 'check'
    });

    editDialog.value = false;
  } catch (err) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to update technique',
      icon: 'report_problem'
    });
  }
}

async function updateProgress(status: string): Promise<void> {
  try {
    await progressStore.updateTechniqueProgress(technique.value.id, {
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'InProgress' && !technique.value.progress?.started_at
        ? { started_at: new Date().toISOString() } : {}),
      ...(status === 'Mastered' ? { completed_at: new Date().toISOString() } : {})
    });

    // Update local technique data
    if (technique.value.progress) {
      technique.value.progress = {
        ...technique.value.progress,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'InProgress' && !technique.value.progress.started_at
          ? { started_at: new Date().toISOString() } : {}),
        ...(status === 'Mastered' ? { completed_at: new Date().toISOString() } : {})
      };
    }

    $q.notify({
      color: 'positive',
      position: 'top',
      message: `Progress updated to ${formatProgressStatus(status)}`,
      icon: 'check'
    });
  } catch (err) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to update progress',
      icon: 'report_problem'
    });
  }
}

function addToLearningPlan(): void {
  learningPlan.technique_id = technique.value.id;

  // Safely handle date formatting for target_date
  const targetDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const dateStr = targetDate.toISOString().split('T')[0];
  if (dateStr) {
    learningPlan.target_date = dateStr;
  } else {
    learningPlan.target_date = targetDate.toISOString().substring(0, 10);
  }

  learningPlan.notes = '';
  learningPlan.priority = 'medium';
  planDialog.value = true;
}

async function saveLearningPlan(): Promise<void> {
  try {
    void progressStore.addToLearningPlan(learningPlan);

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Technique added to learning plan',
      icon: 'check'
    });

    planDialog.value = false;
  } catch (err) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to add technique to learning plan',
      icon: 'report_problem'
    });
  }
}

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

function getDifficultyColor(level: number | string): string {
  const numLevel = typeof level === 'string' ? parseInt(level) : level;
  switch (numLevel) {
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

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
</script>

<style lang="scss">
.tab-notation {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.4;
  font-size: 14px;
}

.font-monospace {
  font-family: monospace;
}

.practice-card {
  height: 100%;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
