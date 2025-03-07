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
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Project Details</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="project.title"
                    label="Project Title *"
                    :rules="[val => !!val || 'Title is required']"
                    outlined
                    lazy-rules
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="project.description"
                    label="Description"
                    type="textarea"
                    rows="3"
                    outlined
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Creative Direction</div>

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
                      v-for="(directive, index) in project.creative_directives"
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
            </q-card-section>
          </q-card>

          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Production Notes</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="project.workflow_notes"
                    label="Workflow Notes"
                    type="textarea"
                    rows="4"
                    outlined
                    hint="Describe your preferred workflow, learning goals, or specific techniques you want to explore"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
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
              />
            </q-card-actions>
          </q-card>
        </q-form>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Project Assistant</div>
          </q-card-section>

          <q-card-section>
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
          </q-card-section>

          <q-card-section v-if="isEditing">
            <q-btn
              color="secondary"
              class="full-width"
              label="Generate Briefing"
              icon="description"
              unelevated
              @click="generateBriefing"
            />
          </q-card-section>
        </q-card>
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

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const artistStore = useArtistStore();
const gearStore = useGearStore();

const project = ref({
  id: '',
  title: '',
  description: '',
  collaborators: [],
  equipment: [],
  creative_directives: [],
  workflow_notes: '',
  created_at: '',
  updated_at: ''
});

const selectedArtists = ref([]);
const selectedGear = ref([]);
const artistOptions = ref([]);
const gearOptions = ref([]);
const newDirective = ref('');

const isEditing = computed(() => !!route.params.id);

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
      project.value = { ...projectData };

      // Set selected values for dropdowns
      selectedArtists.value = project.value.collaborators.map(id => {
        const artist = artistStore.getArtistById(id);
        return {
          label: artist?.name || id,
          value: id
        };
      });

      selectedGear.value = project.value.equipment.map(id => {
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

function filterArtists(val, update) {
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
      .filter(artist => artist.name.toLowerCase().indexOf(needle) > -1)
      .map(artist => ({
        label: artist.name,
        value: artist.id
      }));
  });
}

function addCreativeDirective() {
  if (newDirective.value.trim() !== '') {
    project.value.creative_directives.push(newDirective.value.trim());
    newDirective.value = '';
  }
}

function removeDirective(index) {
  project.value.creative_directives.splice(index, 1);
}

async function onSubmit() {
  try {
    // Map selected values back to IDs for saving
    project.value.collaborators = selectedArtists.value.map(item => item.value);
    project.value.equipment = selectedGear.value.map(item => item.value);

    if (isEditing.value) {
      await projectStore.updateProject(project.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Project updated successfully',
        icon: 'check'
      });
    } else {
      const newProject = await projectStore.createProject(project.value);
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Project created successfully',
        icon: 'check'
      });
      router.push(`/projects/${newProject.id}`);
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: isEditing.value ? 'Failed to update project' : 'Failed to create project',
      icon: 'report_problem'
    });
  }
}

async function generateBriefing() {
  if (!isEditing.value) return;

  try {
    $q.loading.show({
      message: 'Generating project briefing...'
    });

    await projectStore.generateBriefing(project.value.id);

    $q.loading.hide();
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Briefing generated successfully',
      icon: 'check'
    });

    router.push(`/projects/${project.value.id}/briefing`);
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
