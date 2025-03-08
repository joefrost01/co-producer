<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Artists</h1>
      <q-btn
        color="primary"
        icon="add"
        label="Add Artist"
        @click="openAddDialog"
        unelevated
      />
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <!-- Artist filters -->
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Filters</div>

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
              v-model="filters.instrument"
              :options="instrumentOptions"
              label="Instrument"
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
              v-model="filters.tags"
              :options="tagOptions"
              label="Tags"
              outlined
              dense
              multiple
              use-chips
              clearable
              class="q-mb-md"
            />

            <div class="row justify-end">
              <q-btn flat color="grey" label="Reset" @click="resetFilters" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Artist grid -->
      <div class="col-12 col-md-9">
        <div v-if="loading" class="flex justify-center items-center" style="min-height: 200px">
          <q-spinner size="40px" color="primary" />
        </div>

        <div v-else-if="filteredArtists.length === 0" class="text-center q-pa-xl">
          <q-icon name="person_off" size="60px" color="grey-5" />
          <p class="text-h6 q-mt-md">No artists found</p>
          <p class="text-body1">Try adjusting your filters or add a new artist.</p>
          <q-btn color="primary" label="Add Artist" icon="add" unelevated @click="openAddDialog" class="q-mt-sm" />
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div v-for="artist in filteredArtists" :key="artist.id" class="col-12 col-sm-6 col-md-4">
              <q-card class="artist-card">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <q-avatar color="primary" text-color="white" size="50px">
                      {{ artist.name.charAt(0) }}
                    </q-avatar>

                    <div class="q-ml-md">
                      <div class="text-h6 text-no-wrap">{{ artist.name }}</div>
                      <div class="text-subtitle2">{{ artist.instrument }}</div>
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                  <div class="text-subtitle2">
                    <q-icon name="circle" size="xs" color="amber" class="q-mr-xs" />
                    Difficulty: {{ artist.difficulty }}
                  </div>

                  <div v-if="artist.band" class="text-subtitle2 q-mt-sm">
                    <q-icon name="group" size="xs" class="q-mr-xs" />
                    {{ artist.band }}
                  </div>

                  <div v-if="artist.era" class="text-subtitle2 q-mt-sm">
                    <q-icon name="history" size="xs" class="q-mr-xs" />
                    {{ artist.era }}
                  </div>

                  <div class="q-mt-sm">
                    <q-chip
                      v-for="tag in artist.tags"
                      :key="tag"
                      size="sm"
                      color="grey-3"
                      text-color="grey-8"
                      class="q-ma-none q-mr-xs"
                    >
                      {{ tag }}
                    </q-chip>
                  </div>

                  <div class="q-mt-md">
                    <p class="ellipsis-3-lines">{{ artist.description }}</p>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
                  <q-btn flat round color="grey" icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="editArtist(artist)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>Edit</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="confirmDeleteArtist(artist)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>Delete</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>

                  <q-btn flat color="primary" label="View Details" @click="viewArtist(artist)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Artist Dialog -->
    <q-dialog v-model="artistDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit Artist' : 'Add New Artist' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md" style="max-height: 80vh" scroll>
          <q-form @submit="saveArtist" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="editedArtist.name"
                  label="Artist Name *"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="editedArtist.instrument"
                  label="Instrument/Role *"
                  outlined
                  :rules="[val => !!val || 'Instrument is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="editedArtist.band"
                  label="Band/Group"
                  outlined
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="editedArtist.era"
                  label="Era"
                  outlined
                  hint="e.g., 1970s, Modern, Classical"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="editedArtist.difficulty"
                  :options="['easy', 'moderate', 'challenging']"
                  label="Difficulty Level *"
                  outlined
                  :rules="[val => !!val || 'Difficulty is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="editedArtist.tags"
                  :options="tagOptions"
                  label="Tags"
                  multiple
                  use-input
                  use-chips
                  outlined
                  new-value-mode="add-unique"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="editedArtist.description"
                  type="textarea"
                  label="Description *"
                  outlined
                  rows="4"
                  :rules="[val => !!val || 'Description is required']"
                />
              </div>
            </div>

            <div class="q-mt-lg">
              <div class="text-h6">Techniques</div>
              <p class="text-caption">Add signature techniques associated with this artist</p>

              <div v-for="(technique, index) in editedArtist.techniques" :key="index" class="q-mb-md">
                <q-card bordered>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="technique.name"
                          label="Technique Name *"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-slider
                          v-model="technique.difficulty"
                          :min="1"
                          :max="5"
                          :step="1"
                          label
                          label-always
                          markers
                          marker-labels
                          :marker-labels-class="markerLabelsClass"
                          class="q-mt-xl"
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="technique.description"
                          label="Description"
                          type="textarea"
                          outlined
                          dense
                          rows="2"
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="technique.instructions"
                          label="Instructions"
                          type="textarea"
                          outlined
                          dense
                          rows="2"
                        />
                      </div>
                    </div>

                    <div class="row justify-end q-mt-sm">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        @click="removeTechnique(index)"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="row justify-center q-mt-md">
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="Add Technique"
                  @click="addTechnique"
                />
              </div>
            </div>

            <div class="q-mt-lg">
              <div class="text-h6">Gear Settings</div>
              <p class="text-caption">Add typical gear settings associated with this artist</p>

              <div v-for="(gear, index) in editedArtist.gear_settings" :key="index" class="q-mb-md">
                <q-card bordered>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="gear.gear_type"
                          :options="['amp', 'pedal', 'instrument', 'plugin', 'software', 'other']"
                          label="Gear Type *"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="gear.gear_name"
                          label="Gear Name *"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="gear.description"
                          label="Description"
                          type="textarea"
                          outlined
                          dense
                          rows="2"
                        />
                      </div>

                      <div class="col-12">
                        <p class="text-subtitle2 q-mb-sm">Settings</p>

                        <div v-for="(value, key, i) in gear.settings" :key="i" class="row q-col-gutter-sm q-mb-xs">
                          <div class="col-5">
                            <q-input
                              v-model="settingKeys[index][i]"
                              label="Parameter"
                              outlined
                              dense
                              @update:model-value="updateGearSettingKey(index, i, key)"
                            />
                          </div>
                          <div class="col-5">
                            <q-input
                              v-model="gear.settings[settingKeys[index][i]]"
                              label="Value"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-2 flex items-center">
                            <q-btn
                              flat
                              round
                              color="negative"
                              icon="remove"
                              size="sm"
                              @click="removeGearSetting(index, key)"
                            />
                          </div>
                        </div>

                        <div class="row justify-center q-mt-sm">
                          <q-btn
                            outline
                            color="grey"
                            icon="add"
                            label="Add Setting"
                            size="sm"
                            @click="addGearSetting(index)"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="row justify-end q-mt-sm">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        @click="removeGear(index)"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="row justify-center q-mt-md">
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="Add Gear Setting"
                  @click="addGear"
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

    <!-- Delete confirmation dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Delete artist "{{ artistToDelete?.name }}"?</span>
        </q-card-section>

        <q-card-section>
          This action cannot be undone. The artist and all associated techniques will be permanently deleted.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteArtist" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

// Replace the script section in src/pages/ArtistList.vue

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useArtistStore } from 'src/stores/artist-store';
import { useTagStore } from 'src/stores/tag-store';
import type { Artist, Technique, GearSetting } from 'src/models';

const $q = useQuasar();
const router = useRouter();
const artistStore = useArtistStore();
const tagStore = useTagStore();

const loading = ref(true);
const artistDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const artistToDelete = ref<Artist | null>(null);
const settingKeys = ref<string[][]>([]);

// Filters
const filters = reactive({
  search: '',
  instrument: null as string | null,
  difficulty: null as string | null,
  tags: [] as string[]
});

// Form state
const editedArtist = ref<Artist>({
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

// Options for filters and form selects
const instrumentOptions = computed(() => {
  const instruments = [...new Set(artistStore.artists.map(a => a.instrument))].filter(Boolean);
  return instruments.map(instrument => ({
    label: instrument,
    value: instrument
  }));
});

const difficultyOptions = computed(() => [
  { label: 'Easy', value: 'easy' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Challenging', value: 'challenging' }
]);

const tagOptions = computed(() => {
  return tagStore.tags.map(tag => tag);
});

// Filtered artists based on selected filters
const filteredArtists = computed(() => {
  return artistStore.artists.filter(artist => {
    // Search filter
    if (filters.search && !artist.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !artist.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Instrument filter
    if (filters.instrument && artist.instrument !== filters.instrument) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && artist.difficulty !== filters.difficulty) {
      return false;
    }

    // Tags filter
    if (filters.tags.length > 0 && !filters.tags.every(tag => artist.tags.includes(tag))) {
      return false;
    }

    return true;
  });
});

interface MarkerLabels {
  [key: string]: string;
}

// Marker labels for difficulty slider
const markerLabelsClass = computed<MarkerLabels>(() => {
  return {
    1: 'text-green',
    2: 'text-light-green',
    3: 'text-amber',
    4: 'text-orange',
    5: 'text-red'
  };
});

onMounted(async () => {
  try {
    await artistStore.fetchArtists();
    await tagStore.fetchTags();
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load artists',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

function resetFilters(): void {
  filters.search = '';
  filters.instrument = null;
  filters.difficulty = null;
  filters.tags = [];
}

function openAddDialog(): void {
  isEditing.value = false;
  editedArtist.value = {
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
  };
  settingKeys.value = [];
  artistDialog.value = true;
}

function editArtist(artist: Artist): void {
  isEditing.value = true;
  editedArtist.value = JSON.parse(JSON.stringify(artist)); // Deep copy

  // Initialize settingKeys for gear settings
  settingKeys.value = editedArtist.value.gear_settings.map(gear => {
    return Object.keys(gear.settings || {});
  });

  artistDialog.value = true;
}

function viewArtist(artist: Artist): void {
  void router.push(`/artists/${artist.id}`);
}

function confirmDeleteArtist(artist: Artist): void {
  artistToDelete.value = artist;
  deleteDialog.value = true;
}

async function deleteArtist(): Promise<void> {
  if (!artistToDelete.value) return;

  try {
    await artistStore.deleteArtist(artistToDelete.value.id);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Artist deleted successfully',
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to delete artist',
      icon: 'report_problem'
    });
  }
}

function addTechnique(): void {
  const newTechnique: Technique = {
    id: '',
    artist_id: editedArtist.value.id,
    name: '',
    description: '',
    difficulty: 3,
    tab_notation: '',
    instructions: '',
    progress: { status: 'NotStarted' }
  };

  editedArtist.value.techniques.push(newTechnique);
}

function removeTechnique(index: number): void {
  editedArtist.value.techniques.splice(index, 1);
}

function addGear(): void {
  const newGear: GearSetting = {
    gear_type: '',
    gear_name: '',
    settings: {},
    description: ''
  };

  editedArtist.value.gear_settings.push(newGear);
  settingKeys.value.push([]);
}

function removeGear(index: number): void {
  editedArtist.value.gear_settings.splice(index, 1);
  settingKeys.value.splice(index, 1);
}

function addGearSetting(gearIndex: number): void {
  const gear = editedArtist.value.gear_settings[gearIndex];
  if (!gear) return;

  const gearSettings = gear.settings || {};
  const newKey = `setting${Object.keys(gearSettings).length + 1}`;

  if (!gear.settings) {
    gear.settings = {};
  }

  gear.settings[newKey] = '';

  if (!settingKeys.value[gearIndex]) {
    settingKeys.value[gearIndex] = [];
  }
  settingKeys.value[gearIndex].push(newKey);
}

function removeGearSetting(gearIndex: number, key: string): void {
  if (settingKeys.value[gearIndex]) {
    const keyIndex = settingKeys.value[gearIndex].indexOf(key);
    if (keyIndex !== -1) {
      settingKeys.value[gearIndex].splice(keyIndex, 1);
    }
  }

  const gear = editedArtist.value.gear_settings[gearIndex];
  if (gear && gear.settings) {
    delete gear.settings[key];
  }
}

function updateGearSettingKey(gearIndex: number, keyIndex: number, oldKey: string): void {
  if (!settingKeys.value[gearIndex]) return;

  const newKey = settingKeys.value[gearIndex][keyIndex];
  const gear = editedArtist.value.gear_settings[gearIndex];

  if (newKey && newKey !== oldKey && oldKey && gear && gear.settings) {
    const value = gear.settings[oldKey];
    if (value !== undefined) {
      gear.settings[newKey] = value;
      delete gear.settings[oldKey];
    }
  }
}

async function saveArtist(): Promise<void> {
  try {
    if (isEditing.value) {
      await artistStore.updateArtist(editedArtist.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Artist updated successfully',
        icon: 'check'
      });
    } else {
      await artistStore.createArtist(editedArtist.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Artist created successfully',
        icon: 'check'
      });
    }
    artistDialog.value = false;
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: isEditing.value ? 'Failed to update artist' : 'Failed to create artist',
      icon: 'report_problem'
    });
  }
}
</script>

<style lang="scss">
.artist-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
