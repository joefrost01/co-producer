<template>
  <q-page padding>
    <div v-if="loading">
      <div class="row justify-center items-center" style="height: 400px">
        <q-spinner color="primary" size="3em" />
      </div>
    </div>

    <div v-else>
      <!-- Project header -->
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="row items-center">
            <h1 class="text-h4 q-my-none">{{ project.title }}</h1>
            <q-chip
              v-if="hasBriefing"
              color="secondary"
              text-color="white"
              class="q-ml-md"
            >
              Briefing Available
            </q-chip>
          </div>
          <p class="text-subtitle1 q-mt-sm q-mb-none text-grey-8">
            Created {{ formatDate(project.created_at) }} • Updated {{ formatDate(project.updated_at) }}
          </p>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            outline
            color="primary"
            icon="edit"
            label="Edit"
            :to="`/projects/${project.id}/edit`"
          />
          <q-btn
            v-if="!hasBriefing"
            color="secondary"
            icon="description"
            label="Generate Briefing"
            @click="generateBriefing"
          />
          <q-btn
            v-if="hasBriefing"
            color="secondary"
            icon="refresh"
            label="Refresh Briefing"
            @click="generateBriefing"
          />
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Project content -->
      <div class="row q-col-gutter-md">
        <!-- Project details -->
        <div class="col-12 col-md-5">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Project Details</div>
              <p>{{ project.description || 'No description provided' }}</p>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Artistic Influences</div>
              <div v-if="collaborators.length === 0" class="text-grey">No influences selected</div>
              <div v-else class="row q-col-gutter-sm">
                <div v-for="artist in collaborators" :key="artist.id" class="col-6">
                  <q-item class="bg-grey-2 rounded-borders q-pa-sm">
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white">
                        {{ artist.name.charAt(0) }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ artist.name }}</q-item-label>
                      <q-item-label caption>{{ artist.instrument }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Equipment</div>
              <div v-if="equipment.length === 0" class="text-grey">No equipment selected</div>
              <div v-else>
                <q-chip
                  v-for="gear in equipment"
                  :key="gear.id"
                  color="primary"
                  text-color="white"
                  class="q-ma-xs"
                >
                  {{ gear.gear_name }}
                </q-chip>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Creative Directives</div>
              <div v-if="project.creative_directives.length === 0" class="text-grey">No creative directives added</div>
              <div v-else>
                <q-list dense>
                  <q-item v-for="(directive, index) in project.creative_directives" :key="index">
                    <q-item-section avatar>
                      <q-icon name="lightbulb" color="amber" />
                    </q-item-section>
                    <q-item-section>{{ directive }}</q-item-section>
                  </q-item>
                </q-list>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-sm">Workflow Notes</div>
              <p>{{ project.workflow_notes || 'No workflow notes provided' }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Briefing or placeholder -->
        <div class="col-12 col-md-7">
          <div v-if="!hasBriefing" class="flex items-center justify-center" style="min-height: 400px">
            <div class="text-center">
              <q-icon name="description" size="80px" color="grey-5" />
              <h2 class="text-h5 q-mt-md">No Briefing Yet</h2>
              <p class="q-mt-sm">Generate a briefing to get AI-powered assistance for your project.</p>
              <q-btn
                color="secondary"
                label="Generate Briefing"
                icon="description"
                @click="generateBriefing"
                unelevated
                class="q-mt-md"
              />
            </div>
          </div>

          <div v-else>
            <q-tabs
              v-model="activeTab"
              class="text-primary bg-grey-2 q-mb-md"
              align="left"
              narrow-indicator
            >
              <q-tab name="view" label="View Briefing" icon="visibility" />
              <q-tab name="markdown" label="Markdown" icon="code" />
              <q-tab name="json" label="JSON" icon="data_object" />
              <q-tab name="download" label="Download" icon="download" />
            </q-tabs>

            <q-tab-panels v-model="activeTab" animated>
              <!-- View tab -->
              <q-tab-panel name="view">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h5">{{ project.title }} - AI Briefing</div>
                    <div class="text-subtitle2 text-grey-7">Created: {{ briefing && formatDate(briefing.created_at) }}</div>

                    <q-separator class="q-my-md" />

                    <div class="markdown-content" v-html="renderedBriefing"></div>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- Markdown tab -->
              <q-tab-panel name="markdown">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="row justify-between q-mb-md">
                      <div class="text-h6">Markdown Source</div>
                      <q-btn
                        flat
                        dense
                        icon="content_copy"
                        label="Copy"
                        @click="copyToClipboard(markdownSource)"
                      />
                    </div>

                    <q-separator class="q-mb-md" />

                    <q-input
                      v-model="markdownSource"
                      type="textarea"
                      outlined
                      readonly
                      rows="20"
                      class="code-font"
                    />
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- JSON tab -->
              <q-tab-panel name="json">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="row justify-between q-mb-md">
                      <div class="text-h6">JSON Structure</div>
                      <q-btn
                        flat
                        dense
                        icon="content_copy"
                        label="Copy"
                        @click="copyToClipboard(jsonSource)"
                      />
                    </div>

                    <q-separator class="q-mb-md" />

                    <q-input
                      v-model="jsonSource"
                      type="textarea"
                      outlined
                      readonly
                      rows="20"
                      class="code-font"
                    />
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- Download tab -->
              <q-tab-panel name="download">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6">Download Options</div>
                    <p>Choose a format to download the briefing</p>

                    <div class="row q-col-gutter-md q-mt-md">
                      <div class="col-6">
                        <q-card class="cursor-pointer" @click="downloadBriefing('markdown')">
                          <q-card-section class="text-center">
                            <q-icon name="description" size="50px" color="primary" />
                            <div class="text-h6 q-mt-sm">Markdown</div>
                            <p class="q-mt-sm">Download as .md file</p>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="col-6">
                        <q-card class="cursor-pointer" @click="downloadBriefing('json')">
                          <q-card-section class="text-center">
                            <q-icon name="data_object" size="50px" color="secondary" />
                            <div class="text-h6 q-mt-sm">JSON</div>
                            <p class="q-mt-sm">Download as .json file</p>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
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
// Fix for marked import error - install via npm if not already installed
import * as marked from 'marked';
import { Project, Briefing } from 'src/models/project';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const artistStore = useArtistStore();
const gearStore = useGearStore();

const loading = ref(true);
// Fix type to match Project interface from models
const project = ref<Project>({
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
// Initialize as null but with correct type
const briefing = ref<Briefing | null>(null);
const markdownSource = ref('');
const jsonSource = ref('');
const activeTab = ref('view');

const hasBriefing = computed(() => !!briefing.value);

const renderedBriefing = computed(() => {
  if (!markdownSource.value) return '';
  return marked.parse(markdownSource.value);
});

const collaborators = computed(() => {
  return project.value.collaborators.map(id => {
    return artistStore.getArtistById(id) || { id, name: 'Unknown Artist', instrument: 'Unknown' };
  });
});

const equipment = computed(() => {
  return project.value.equipment.map(id => {
    return gearStore.getGearById(id) || { id, gear_name: 'Unknown Gear' };
  });
});

onMounted(async () => {
  try {
    const id = route.params.id as string;

    // Load related data
    await Promise.all([
      artistStore.fetchArtists(),
      gearStore.fetchGear()
    ]);

    // Load project
    const projectData = await projectStore.fetchProject(id);
    project.value = { ...projectData };

    // Try to load briefing if available
    try {
      briefing.value = await projectStore.fetchBriefing(id);
      markdownSource.value = await projectStore.fetchBriefingMarkdown(id);
      jsonSource.value = JSON.stringify(await projectStore.fetchBriefingJson(id), null, 2);
    } catch (err) {
      // Briefing not available yet
      briefing.value = null;
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load project',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
});

// Add type to function parameter
function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function generateBriefing(): Promise<void> {
  try {
    $q.loading.show({
      message: 'Generating project briefing...'
    });

    await projectStore.generateBriefing(project.value.id);

    // Reload the briefing data
    briefing.value = await projectStore.fetchBriefing(project.value.id);
    markdownSource.value = await projectStore.fetchBriefingMarkdown(project.value.id);
    jsonSource.value = JSON.stringify(await projectStore.fetchBriefingJson(project.value.id), null, 2);

    $q.loading.hide();
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Briefing generated successfully',
      icon: 'check'
    });

    // Switch to view tab
    activeTab.value = 'view';
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

// Add type to function parameter
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Copied to clipboard',
      icon: 'check',
      timeout: 1000
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to copy to clipboard',
      icon: 'report_problem'
    });
  }
}

// Add type to function parameter
function downloadBriefing(type: string): void {
  const fileName = `${project.value.title.replace(/\s+/g, '_')}_briefing`;
  let content = '';
  let fileType = '';

  if (type === 'markdown') {
    content = markdownSource.value;
    fileType = 'md';
  } else if (type === 'json') {
    content = jsonSource.value;
    fileType = 'json';
  }

  // Create a blob and download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${fileType}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  $q.notify({
    color: 'positive',
    position: 'top',
    message: `Briefing downloaded as ${fileType.toUpperCase()}`,
    icon: 'check'
  });
}
</script>

<style lang="scss">
.code-font {
  font-family: monospace;
}

.markdown-content {
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  h1 {
    font-size: 1.8em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.3em;
  }

  p {
    margin-bottom: 1em;
  }

  ul, ol {
    margin-left: 2em;
    margin-bottom: 1em;
  }

  code {
    background-color: #f1f1f1;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  pre {
    background-color: #f1f1f1;
    padding: 1em;
    border-radius: 3px;
    overflow-x: auto;
    margin-bottom: 1em;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 1em;
    margin-left: 0;
    color: #555;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1em;

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }

    th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #f2f2f2;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  }
}
</style>
