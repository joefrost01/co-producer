<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Gear & Equipment</h1>
      <q-btn
        color="primary"
        icon="add"
        label="Add Gear"
        @click="openAddDialog"
        unelevated
      />
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <!-- Gear filters -->
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
              v-model="filters.type"
              :options="gearTypeOptions"
              label="Gear Type"
              outlined
              dense
              emit-value
              map-options
              clearable
              class="q-mb-md"
            />

            <div class="row justify-end">
              <q-btn flat color="grey" label="Reset" @click="resetFilters" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Gear grid -->
      <div class="col-12 col-md-9">
        <div v-if="loading" class="flex justify-center items-center" style="min-height: 200px">
          <q-spinner size="40px" color="primary" />
        </div>

        <div v-else-if="filteredGear.length === 0" class="text-center q-pa-xl">
          <q-icon name="hardware" size="60px" color="grey-5" />
          <p class="text-h6 q-mt-md">No equipment found</p>
          <p class="text-body1">Try adjusting your filters or add new gear.</p>
          <q-btn color="primary" label="Add Gear" icon="add" unelevated @click="openAddDialog" class="q-mt-sm" />
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div v-for="gear in filteredGear" :key="gear.id" class="col-12 col-sm-6 col-md-4">
              <q-card class="gear-card">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <q-avatar :color="getGearTypeColor(gear.gear_type)" text-color="white" size="50px">
                      <q-icon :name="getGearTypeIcon(gear.gear_type)" />
                    </q-avatar>

                    <div class="q-ml-md">
                      <div class="text-h6 text-no-wrap">{{ gear.gear_name }}</div>
                      <div class="text-subtitle2">{{ formatGearType(gear.gear_type) }}</div>
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                  <div class="q-mt-sm">
                    <p class="ellipsis-3-lines">{{ gear.description }}</p>
                  </div>

                  <div v-if="Object.keys(gear.settings).length" class="q-mt-sm">
                    <p class="text-subtitle2 q-mb-xs">Settings:</p>
                    <div v-for="(value, key) in gear.settings" :key="key" class="text-caption q-mb-xs">
                      <span class="text-weight-medium">{{ key }}: </span>{{ value }}
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
                  <q-btn flat round color="grey" icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="editGear(gear)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>Edit</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="duplicateGear(gear)">
                          <q-item-section avatar>
                            <q-icon name="content_copy" />
                          </q-item-section>
                          <q-item-section>Duplicate</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="confirmDeleteGear(gear)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>Delete</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Gear Dialog -->
    <q-dialog v-model="gearDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit Gear' : 'Add New Gear' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="saveGear" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="editedGear.gear_type"
                  :options="gearTypeOptions"
                  label="Gear Type *"
                  outlined
                  :rules="[val => !!val || 'Gear type is required']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="editedGear.gear_name"
                  label="Gear Name *"
                  outlined
                  :rules="[val => !!val || 'Gear name is required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="editedGear.description"
                  type="textarea"
                  label="Description"
                  outlined
                  rows="3"
                />
              </div>
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle1 q-mb-sm">Settings</div>
              <p class="text-caption q-mb-md">Add parameter settings for this gear (e.g., knob positions, presets, etc.)</p>

              <div v-for="(key, index) in settingKeys" :key="index" class="row q-col-gutter-sm q-mb-xs">
                <div class="col-5">
                  <q-input
                    v-model="settingKeys[index]"
                    label="Parameter"
                    outlined
                    dense
                    @update:model-value="(newVal) => updateSettingKey(index, key, String(newVal))"
                  />
                </div>
                <div class="col-5">
                  <q-input
                    v-model="editedGear.settings[key]"
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
                    @click="removeSetting(key)"
                  />
                </div>
              </div>

              <div class="row justify-center q-mt-md">
                <q-btn
                  outline
                  color="grey"
                  icon="add"
                  label="Add Setting"
                  size="sm"
                  @click="addSetting"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-md">
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
          <span class="q-ml-sm">Delete "{{ gearToDelete?.gear_name }}"?</span>
        </q-card-section>

        <q-card-section>
          This action cannot be undone. The gear and all associated settings will be permanently deleted.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteGear" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useGearStore } from 'src/stores/gear-store';
import { GearItem } from 'src/models/gear';

const $q = useQuasar();
const gearStore = useGearStore();

const loading = ref(true);
const gearDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const gearToDelete = ref<GearItem | null>(null);
const settingKeys = ref<string[]>([]);

// Filters
const filters = reactive({
  search: '',
  type: null as string | null
});

// Form state
const editedGear = ref<GearItem>({
  id: '',
  gear_type: '',
  gear_name: '',
  settings: {},
  description: ''
});

// Options for filters and form selects
const gearTypeOptions = [
  { label: 'Amplifier', value: 'amp' },
  { label: 'Pedal', value: 'pedal' },
  { label: 'Instrument', value: 'instrument' },
  { label: 'Plugin', value: 'plugin' },
  { label: 'Software', value: 'software' },
  { label: 'DAW', value: 'daw' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Other', value: 'other' }
];

// Filtered gear based on selected filters
const filteredGear = computed(() => {
  return gearStore.gear.filter(item => {
    // Search filter
    if (filters.search && !item.gear_name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !item.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.type && item.gear_type !== filters.type) {
      return false;
    }

    return true;
  });
});

onMounted(async () => {
  try {
    await gearStore.fetchGear();
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load gear',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

function resetFilters() {
  filters.search = '';
  filters.type = null;
}

function openAddDialog() {
  isEditing.value = false;
  editedGear.value = {
    id: '',
    gear_type: '',
    gear_name: '',
    settings: {},
    description: ''
  };
  settingKeys.value = [];
  gearDialog.value = true;
}

function editGear(gear: GearItem) {
  isEditing.value = true;
  editedGear.value = JSON.parse(JSON.stringify(gear)); // Deep copy

  // Initialize settingKeys
  settingKeys.value = Object.keys(gear.settings || {});

  gearDialog.value = true;
}

function duplicateGear(gear: GearItem) {
  const gearCopy = JSON.parse(JSON.stringify(gear));
  gearCopy.id = '';
  gearCopy.gear_name = `${gearCopy.gear_name} (Copy)`;

  isEditing.value = false;
  editedGear.value = gearCopy;
  settingKeys.value = Object.keys(gearCopy.settings || {});

  gearDialog.value = true;
}

function confirmDeleteGear(gear: GearItem) {
  gearToDelete.value = gear;
  deleteDialog.value = true;
}

async function deleteGear() {
  if (!gearToDelete.value) return;

  try {
    await gearStore.deleteGear(gearToDelete.value.id);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Gear deleted successfully',
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to delete gear',
      icon: 'report_problem'
    });
  }
}

function addSetting() {
  const newKey = `setting${Object.keys(editedGear.value.settings).length + 1}`;
  editedGear.value.settings[newKey] = '';
  settingKeys.value.push(newKey);
}

function removeSetting(key: string) {
  const keyIndex = settingKeys.value.indexOf(key);
  if (keyIndex !== -1) {
    settingKeys.value.splice(keyIndex, 1);
  }
  delete editedGear.value.settings[key];
}

function updateSettingKey(index: number, oldKey: string, newKeyValue?: string) {
  const newKey = settingKeys.value[index];
  if (newKey && newKey !== oldKey && oldKey) {
    const value = editedGear.value.settings[oldKey];
    editedGear.value.settings[newKey] = value;
    delete editedGear.value.settings[oldKey];
  }
}

async function saveGear() {
  try {
    if (isEditing.value) {
      await gearStore.updateGear(editedGear.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Gear updated successfully',
        icon: 'check'
      });
    } else {
      await gearStore.createGear(editedGear.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Gear created successfully',
        icon: 'check'
      });
    }
    gearDialog.value = false;
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: isEditing.value ? 'Failed to update gear' : 'Failed to create gear',
      icon: 'report_problem'
    });
  }
}

function formatGearType(type: string): string {
  const option = gearTypeOptions.find(opt => opt.value === type);
  return option ? option.label : type;
}

function getGearTypeColor(type: string): string {
  switch (type) {
    case 'amp': return 'deep-orange';
    case 'pedal': return 'green';
    case 'instrument': return 'blue';
    case 'plugin': return 'purple';
    case 'software': return 'indigo';
    case 'daw': return 'teal';
    case 'hardware': return 'brown';
    default: return 'grey';
  }
}

function getGearTypeIcon(type: string): string {
  switch (type) {
    case 'amp': return 'speaker';
    case 'pedal': return 'pedal_bike';
    case 'instrument': return 'piano';
    case 'plugin': return 'extension';
    case 'software': return 'code';
    case 'daw': return 'dashboard';
    case 'hardware': return 'memory';
    default: return 'settings';
  }
}
</script>

<style lang="scss">
.gear-card {
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
