<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">{{ isEditing ? 'Edit Project' : 'New Project' }}</h1>
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to Projects"
        to="/projects"
      />
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <EntityCard>
            <template #header>
              <div class="text-h6 q-mb-md">Project Details</div>
            </template>

            <template #content>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="formData.title"
                    label="Project Title *"
                    :rules="[val => !!val || 'Title is required']"
                    outlined
                    lazy-rules
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="formData.description"
                    label="Description"
                    type="textarea"
                    rows="3"
                    outlined
                  />
                </div>
              </div>
            </template>
          </EntityCard>

          <EntityCard>
            <template #header>
              <div class="text-h6 q-mb-md">Creative Direction</div>
            </template>

            <template #content>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="selectedArtists"
                    :options="artistOptions"
                    label="Artistic Influences"
                    multiple
                    use-chips
                    use-input
                    outlined
                    @filter="filterArtists"
                  />
                </div>

                <div class="col-12">
                  <q-select
                    v-model="selectedGear"
                    :options="gearOptions"
                    label="Equipment & Plugins"
                    multiple
                    use-chips
                    outlined
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="newDirective"
                    label="Add Creative Directive"
                    hint="Press Enter to add"
                    outlined
                    clearable
                    @keyup.enter="addCreativeDirective"
                  >
                    <template v-slot:append>
                      <q-btn
                        round
                        flat
                        icon="add"
                        @click="addCreativeDirective"
                      />
                    </template>
                  </q-input>

                  <div class="q-mt-sm">
                    <q-chip
                      v-for="(directive, index) in formData.creative_directives"
                      :key="index"
                      removable
                      @remove="removeDirective(index)"
                      color="primary"
                      text-color="white"
                      class="q-ma-xs"
                    >
                      {{ directive }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </template>
          </EntityCard>

          <EntityCard>
            <template #header>
              <div class="text-h6 q-mb-md">Production Notes</div>
            </template>

            <template #content>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="formData.workflow_notes"
                    label="Workflow Notes"
                    type="textarea"
                    rows="4"
                    outlined
                    hint="Describe your preferred workflow, learning goals, or specific techniques you want to explore"
                  />
                </div>
              </div>
            </template>

            <template #actions>
              <q-btn
                label="Cancel"
                to="/projects"
                flat
                color="grey"
              />
              <q-btn
                :label="isEditing ? 'Update Project' : 'Create Project'"
                type="submit"
                color="primary"
                unelevated
                :loading="loading"
              />
            </template>
          </EntityCard>
        </q-form>
      </div>

      <div class="col-12 col-md-4">
        <EntityCard>
          <template #header>
            <div class="text-h6">Project Assistant</div>
          </template>

          <template #content>
            <p class="text-body1">
              {{ isEditing ? 'Update your project details to refine AI collaboration.' : 'Define your project to start collaborating with AI.' }}
            </p>

            <q-list bordered separator>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="lightbulb" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Define clear goals</q-item-label>
                  <q-item-label caption>Set specific learning objectives and production targets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="person" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Add influences</q-item-label>
                  <q-item-label caption>Include artists that inspire the sound you're after</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="settings" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Specify your gear</q-item-label>
                  <q-item-label caption>List available equipment for targeted suggestions</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="description" color="purple" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Generate briefing</q-item-label>
                  <q-item-label caption>After saving, generate an AI briefing pack</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>

          <template #actions v-if="isEditing">
            <q-btn
              color="secondary"
              class="full-width"
              label="Generate Briefing"
              icon="description"
              unelevated
              @click="generateBriefing"
            />
          </template>
        </EntityCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useProjectStore } from 'src/stores/project-store';
import { useArtistStore } from 'src/stores/artist-store';
import { useGearStore } from 'src/stores/gear-store';
import { useForm } from 'src/composables/useForm';
import EntityCard from 'src/components/common/EntityCard.vue';
import type { Project } from 'src/models/project';
import type { SelectOption } from 'src/models/common';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const artistStore = useArtistStore();
const gearStore = useGearStore();

const newDirective = ref('');
const selectedArtists = ref<SelectOption[]>([]);
const selectedGear = ref<SelectOption[]>([]);
const artistOptions = ref<SelectOption[]>([]);
const gearOptions = ref<SelectOption[]>([]);

const isEditing = computed(() => !!route.params.id);

// Initialize form with default project structure
const defaultProject: Project = {
  id: '',
  title: '',
  description: '',
  collaborators: [],
  equipment: [],
  creative_directives: [],
  workflow_notes: '',
  created_at: '',
  updated_at: '',
  has_briefing: false,
  tags: []
};

// Use the form composable
const { formData, loading, handleSubmit } = useForm<Project>(
  defaultProject,
  saveProject,
  { resetAfterSave: false }
);

onMounted(async () => {
  try {
    // Load artists and gear for dropdowns
    await artistStore.fetchArtists();
    await gearStore.fetchGear();

    // Populate options
    artistOptions.value = artistStore.artists.map(artist => ({
      label: artist.name,
      value: artist.id
    }));

    gearOptions.value = gearStore.gear.map(item => ({
      label: item.gear_name,
      value: item.id
    }));

    // If editing, load project data
    if (isEditing.value) {
      const projectData = await projectStore.fetchProject(route.params.id as string);
      Object.assign(formData.value, projectData);

      // Set selected values for dropdowns
      selectedArtists.value = formData.value.collaborators.map((id: string) => {
        const artist = artistStore.getArtistById(id);
        return {
          label: artist?.name || id,
          value: id
        };
      });

      selectedGear.value = formData.value.equipment.map((id: string) => {
        const gear = gearStore.getGearById(id);
        return {
          label: gear?.gear_name || id,
          value: id
        };
      });
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load data',
      icon: 'report_problem'
    });
  }
});

function filterArtists(val: string, update: (fn: () => void) => void) {
  if (val === '') {
    update(() => {
      artistOptions.value = artistStore.artists.map(artist => ({
        label: artist.name,
        value: artist.id
      }));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    artistOptions.value = artistStore.artists
      .filter(artist => artist.name.toLowerCase().includes(needle))
      .map(artist => ({
        label: artist.name,
        value: artist.id
      }));
  });
}

function addCreativeDirective() {
  if (newDirective.value.trim() !== '') {
    formData.value.creative_directives.push(newDirective.value.trim());
    newDirective.value = '';
  }
}

function removeDirective(index: number) {
  formData.value.creative_directives.splice(index, 1);
}

async function saveProject(project: Project): Promise<Project> {
  // Map selected values back to IDs for saving
  project.collaborators = selectedArtists.value.map(item => item.value as string);
  project.equipment = selectedGear.value.map(item => item.value as string);

  try {
    let savedProject: Project;

    if (isEditing.value) {
      savedProject = await projectStore.updateProject(project);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Project updated successfully',
        icon: 'check'
      });
    } else {
      savedProject = await projectStore.createProject(project);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Project created successfully',
        icon: 'check'
      });
      router.push(`/projects/${savedProject.id}`);
    }

    return savedProject;
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: isEditing.value ? 'Failed to update project' : 'Failed to create project',
      icon: 'report_problem'
    });
    throw error;
  }
}

async function generateBriefing() {
  if (!isEditing.value) return;

  try {
    $q.loading.show({
      message: 'Generating project briefing...'
    });

    await projectStore.generateBriefing(formData.value.id);

    $q.loading.hide();
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Briefing generated successfully',
      icon: 'check'
    });

    // Use await here
    await router.push(`/projects/${formData.value.id}/briefing`);
  } catch (error) {
    $q.loading.hide();
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to generate briefing',
      icon: 'report_problem'
    });
  }
}
</script>
