<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Tags</h1>
      <q-btn
        color="primary"
        icon="add"
        label="Add Tag"
        @click="openAddDialog"
        unelevated
      />
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <!-- Tag management -->
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-lg">Manage Tags</div>

            <div v-if="loading" class="flex justify-center items-center" style="min-height: 200px">
              <q-spinner size="40px" color="primary" />
            </div>

            <div v-else-if="tags.length === 0" class="text-center q-pa-xl">
              <q-icon name="sell" size="60px" color="grey-5" />
              <p class="text-h6 q-mt-md">No tags found</p>
              <p class="text-body1">Add tags to help organize your artists, projects, and techniques.</p>
              <q-btn color="primary" label="Add Tag" icon="add" unelevated @click="openAddDialog" class="q-mt-sm" />
            </div>

            <div v-else>
              <q-input
                v-model="search"
                placeholder="Search tags"
                dense
                outlined
                class="q-mb-md"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>

              <div class="tag-grid q-mt-md">
                <q-chip
                  v-for="tag in filteredTags"
                  :key="tag"
                  color="primary"
                  text-color="white"
                  square
                  class="tag-chip"
                >
                  <div class="row items-center full-width justify-between">
                    <div>{{ tag }}</div>
                    <q-btn flat round dense icon="close" size="xs" @click="confirmDeleteTag(tag)" />
                  </div>
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tag utilities -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Tag Utilities</div>

            <q-card class="q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 q-mb-sm">Merge Tags</div>
                <p class="text-body2 q-mb-md">Combine two tags into one and update all associated items.</p>

                <q-form @submit="mergeTags" class="q-gutter-md">
                  <q-select
                    v-model="mergeForm.source"
                    :options="tags"
                    label="Source Tag"
                    outlined
                    dense
                    use-input
                    input-debounce="0"
                    :rules="[val => !!val || 'Select source tag']"
                  />

                  <q-select
                    v-model="mergeForm.target"
                    :options="tags.filter(t => t !== mergeForm.source)"
                    label="Target Tag"
                    outlined
                    dense
                    use-input
                    input-debounce="0"
                    :rules="[
                      val => !!val || 'Select target tag',
                      val => val !== mergeForm.source || 'Source and target cannot be the same'
                    ]"
                  />

                  <q-btn
                    type="submit"
                    color="secondary"
                    label="Merge Tags"
                    :disabled="!mergeForm.source || !mergeForm.target || mergeForm.source === mergeForm.target"
                    class="full-width"
                  />
                </q-form>
              </q-card-section>
            </q-card>

            <q-card>
              <q-card-section>
                <div class="text-subtitle1 q-mb-sm">Tag Usage</div>
                <p class="text-body2 q-mb-md">See how your tags are being used.</p>

                <q-list separator>
                  <q-item v-for="(count, tagName) in tagUsageCounts" :key="tagName">
                    <q-item-section>
                      <q-item-label>{{ tagName }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip
                        dense
                        :color="getUsageColor(count)"
                        text-color="white"
                      >
                        {{ count }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Add Tag Dialog -->
    <q-dialog v-model="addDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add New Tag</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addTag">
            <q-input
              v-model="newTag"
              label="Tag Name"
              outlined
              autofocus
              :rules="[
                val => !!val || 'Tag name is required',
                val => !tags.includes(val) || 'Tag already exists'
              ]"
            />

            <div class="row justify-end q-mt-md">
              <q-btn flat label="Cancel" color="grey" v-close-popup class="q-mr-sm" />
              <q-btn unelevated label="Add Tag" color="primary" type="submit" />
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
          <span class="q-ml-sm">Delete tag "{{ tagToDelete }}"?</span>
        </q-card-section>

        <q-card-section>
          This action will remove the tag from all associated artists, projects, and techniques.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteTag" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merge confirmation dialog -->
    <q-dialog v-model="mergeConfirmDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="merge_type" color="warning" text-color="white" />
          <span class="q-ml-sm">Merge tags?</span>
        </q-card-section>

        <q-card-section>
          <p>This will merge tag "<strong>{{ mergeForm.source }}</strong>" into "<strong>{{ mergeForm.target }}</strong>".</p>
          <p>All items with the source tag will be updated to use the target tag instead. This cannot be undone.</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Merge" color="warning" @click="performMerge" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useTagStore } from 'src/stores/tag-store';
import { useArtistStore } from 'src/stores/artist-store';
import { useProjectStore } from 'src/stores/project-store';

const $q = useQuasar();
const tagStore = useTagStore();
const artistStore = useArtistStore();
const projectStore = useProjectStore();

const loading = ref(true);
const search = ref('');
const addDialog = ref(false);
const deleteDialog = ref(false);
const mergeConfirmDialog = ref(false);
const newTag = ref('');
const tagToDelete = ref('');

// Merge form state
const mergeForm = reactive({
  source: '',
  target: ''
});

// Computed properties
const tags = computed(() => tagStore.tags);

const filteredTags = computed(() => {
  if (!search.value) return tags.value;
  return tags.value.filter(tag =>
    tag.toLowerCase().includes(search.value.toLowerCase())
  );
});

// Define a type for tag counts
interface TagCounts {
  [key: string]: number;
}

// Calculate tag usage counts
const tagUsageCounts = computed(() => {
  const counts: TagCounts = {};

  // Initialize all tags with count 0
  tags.value.forEach(tag => {
    counts[tag] = 0;
  });

  // Count artists
  artistStore.artists.forEach(artist => {
    artist.tags.forEach(tag => {
      if (counts[tag] !== undefined) {
        counts[tag]++;
      }
    });
  });

  // Count projects (assuming projects have tags as well)
  projectStore.projects.forEach(project => {
    if (project.tags) {
      project.tags.forEach(tag => {
        if (counts[tag] !== undefined) {
          counts[tag]++;
        }
      });
    }
  });

  return counts;
});

onMounted(async () => {
  try {
    await Promise.all([
      tagStore.fetchTags(),
      artistStore.fetchArtists(),
      projectStore.fetchProjects()
    ]);
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load tags',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

// Methods
function openAddDialog() {
  newTag.value = '';
  addDialog.value = true;
}

async function addTag() {
  // Check if tag already exists
  if (tags.value.includes(newTag.value)) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Tag already exists',
      icon: 'report_problem'
    });
    return;
  }

  try {
    await tagStore.createTag(newTag.value);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Tag created successfully',
      icon: 'check'
    });
    addDialog.value = false;
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to create tag',
      icon: 'report_problem'
    });
  }
}

function confirmDeleteTag(tag: string) {
  tagToDelete.value = tag;
  deleteDialog.value = true;
}

async function deleteTag() {
  try {
    await tagStore.deleteTag(tagToDelete.value);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Tag deleted successfully',
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to delete tag',
      icon: 'report_problem'
    });
  }
}

function mergeTags() {
  if (mergeForm.source && mergeForm.target && mergeForm.source !== mergeForm.target) {
    mergeConfirmDialog.value = true;
  }
}

async function performMerge() {
  try {
    await tagStore.mergeTags(mergeForm.source, mergeForm.target);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Tags merged successfully',
      icon: 'check'
    });

    // Reset form
    mergeForm.source = '';
    mergeForm.target = '';
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to merge tags',
      icon: 'report_problem'
    });
  }
}

function getUsageColor(count: number): string {
  if (count === 0) return 'grey';
  if (count < 3) return 'blue';
  if (count < 10) return 'teal';
  return 'primary';
}
</script>

<style lang="scss">
.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-chip {
  min-width: 100px;
  justify-content: space-between;
}
</style>
