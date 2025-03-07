<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Projects</h1>
      <q-btn
        color="primary"
        icon="add"
        label="New Project"
        to="/projects/new"
        unelevated
      />
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Your Projects</div>

              <div class="row q-gutter-sm">
                <q-input
                  v-model="search"
                  placeholder="Search projects"
                  dense
                  outlined
                  class="q-mr-sm"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-select
                  v-model="sortBy"
                  :options="sortOptions"
                  label="Sort by"
                  dense
                  outlined
                  emit-value
                  map-options
                  style="min-width: 150px"
                />
              </div>
            </div>

            <q-table
              :rows="filteredProjects"
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

              <template v-slot:no-data>
                <div class="full-width row flex-center q-py-lg">
                  <div class="text-center">
                    <q-icon name="folder" size="48px" color="grey-5" />
                    <div class="text-h6 q-mt-md">No projects found</div>
                    <q-btn
                      class="q-mt-sm"
                      color="primary"
                      unelevated
                      label="Create your first project"
                      to="/projects/new"
                    />
                  </div>
                </div>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="visibility"
                    size="sm"
                    :to="`/projects/${props.row.id}`"
                  >
                    <q-tooltip>View</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    color="secondary"
                    icon="edit"
                    size="sm"
                    :to="`/projects/${props.row.id}/edit`"
                  >
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    color="grey"
                    icon="content_copy"
                    size="sm"
                    @click="duplicateProject(props.row.id)"
                  >
                    <q-tooltip>Duplicate</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="confirmDelete(props.row)"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Delete project "{{ projectToDelete?.title }}"?</span>
        </q-card-section>

        <q-card-section>
          This action cannot be undone. The project and all associated data will be permanently deleted.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteProject" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useProjectStore } from 'src/stores/project-store';
import type { Project } from 'src/stores/project-store';

const $q = useQuasar();
const projectStore = useProjectStore();

const loading = ref(true);
const search = ref('');
const deleteDialog = ref(false);
const projectToDelete = ref<Project | null>(null);
const sortBy = ref('updated');

const sortOptions = [
  { label: 'Recently Updated', value: 'updated' },
  { label: 'Recently Created', value: 'created' },
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' }
];

interface ColumnDefinition {
  name: string;
  required?: boolean;
  label: string;
  align?: 'left' | 'right' | 'center';
  field: string | ((row: any) => any);
  format?: (val: any) => string;
  sortable?: boolean;
}

const columns: ColumnDefinition[] = [
  {
    name: 'title',
    required: true,
    label: 'Project',
    align: 'left',
    field: (row: Project) => row.title,
    format: (val: string) => `${val}`,
    sortable: true
  },
  {
    name: 'description',
    align: 'left',
    label: 'Description',
    field: 'description',
    sortable: false
  },
  {
    name: 'updated_at',
    label: 'Last Updated',
    field: 'updated_at',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString()
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'right'
  }
];

const filteredProjects = computed(() => {
  const projects = [...projectStore.projects];

  // Apply sorting
  switch (sortBy.value) {
    case 'updated':
      projects.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      break;
    case 'created':
      projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'name_asc':
      projects.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'name_desc':
      projects.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  return projects;
});

onMounted(async () => {
  try {
    await projectStore.fetchProjects();
  } catch (_error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load projects',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

function confirmDelete(project: Project) {
  projectToDelete.value = project;
  deleteDialog.value = true;
}

async function deleteProject() {
  if (!projectToDelete.value) return;

  try {
    await projectStore.deleteProject(projectToDelete.value.id);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Project deleted successfully',
      icon: 'check'
    });
  } catch (_error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to delete project',
      icon: 'report_problem'
    });
  }
}

async function duplicateProject(id: string) {
  try {
    const newProject = await projectStore.duplicateProject(id);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Project duplicated successfully',
      icon: 'check'
    });
    // Optionally navigate to the new project
  } catch (_error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to duplicate project',
      icon: 'report_problem'
    });
  }
}
</script>
