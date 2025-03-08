<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4 q-my-none">Settings</h1>
    </div>

    <q-separator class="q-mb-md" />

    <div class="row q-col-gutter-md">
      <!-- General Settings -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-lg">General Settings</div>

            <q-form @submit="saveGeneralSettings" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="settings.username"
                    label="Your Name"
                    outlined
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="settings.email"
                    label="Email"
                    type="email"
                    outlined
                  />
                </div>

                <div class="col-12">
                  <q-select
                    v-model="settings.theme"
                    :options="themeOptions"
                    label="Theme"
                    outlined
                    emit-value
                    map-options
                  />
                </div>

                <div class="col-12">
                  <q-select
                    v-model="settings.defaultInstrument"
                    :options="instrumentOptions"
                    label="Default Instrument"
                    outlined
                    emit-value
                    map-options
                  />
                </div>
              </div>

              <div class="row justify-end q-mt-md">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Save Settings"
                  :loading="saving"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-lg">AI Integration Settings</div>

            <q-form @submit="saveAISettings" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="settings.aiMode"
                    :options="aiModeOptions"
                    label="AI Operation Mode"
                    outlined
                    emit-value
                    map-options
                  />
                </div>

                <div v-if="settings.aiMode === 'online'" class="col-12">
                  <q-input
                    v-model="settings.apiKey"
                    label="API Key"
                    type="password"
                    outlined
                    hint="Enter your LangChain API key"
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showApiKey ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="showApiKey = !showApiKey"
                      />
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <q-toggle
                    v-model="settings.detailedBriefings"
                    label="Generate detailed briefings"
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="settings.maxTokens"
                    label="Max Tokens per Generation"
                    type="number"
                    outlined
                    min="100"
                    max="4000"
                  />
                </div>
              </div>

              <div class="row justify-end q-mt-md">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Save AI Settings"
                  :loading="savingAI"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Backup & Advanced Settings -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-lg">Backup & Restore</div>

            <p class="text-body1 q-mb-lg">
              Backup your data to ensure you don't lose your projects, artists, and progress.
            </p>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-card bordered class="backup-card">
                  <q-card-section class="text-center">
                    <q-icon name="backup" size="48px" color="primary" />
                    <div class="text-h6 q-mt-md">Create Backup</div>
                    <p class="q-mt-sm">
                      Export all your data to a file
                    </p>
                  </q-card-section>

                  <q-card-actions align="center">
                    <q-btn
                      color="primary"
                      label="Backup Now"
                      @click="createBackup"
                      :loading="backingUp"
                      unelevated
                    />
                  </q-card-actions>
                </q-card>
              </div>

              <div class="col-12 col-sm-6">
                <q-card bordered class="backup-card">
                  <q-card-section class="text-center">
                    <q-icon name="restore" size="48px" color="secondary" />
                    <div class="text-h6 q-mt-md">Restore Backup</div>
                    <p class="q-mt-sm">
                      Import data from a backup file
                    </p>
                  </q-card-section>

                  <q-card-actions align="center">
                    <q-btn
                      color="secondary"
                      label="Restore"
                      @click="openRestoreDialog"
                      :loading="restoring"
                      unelevated
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <div class="q-mt-lg">
              <div class="text-subtitle1 q-mb-md">Backup History</div>

              <q-list separator bordered>
                <q-item v-for="backup in backupHistory" :key="backup.id">
                  <q-item-section>
                    <q-item-label>{{ formatDate(backup.date) }}</q-item-label>
                    <q-item-label caption>{{ backup.size }} • {{ backup.items }} items</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn flat round dense icon="download" color="primary" @click="downloadBackup(backup)" />
                      <q-btn flat round dense icon="restore" color="secondary" @click="restoreBackup(backup)" />
                    </div>
                  </q-item-section>
                </q-item>

                <q-item v-if="backupHistory.length === 0">
                  <q-item-section>
                    <q-item-label class="text-grey text-center">No backups found</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-lg">Advanced Settings</div>

            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label>Database Location</q-item-label>
                  <q-item-label caption>{{ settings.dbLocation || './data/database' }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn flat dense round icon="folder" color="primary" @click="selectDatabaseLocation" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>Auto Backup</q-item-label>
                  <q-item-label caption>Automatically create backups on a schedule</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-toggle v-model="settings.autoBackup" color="primary" />
                </q-item-section>
              </q-item>

              <q-item v-if="settings.autoBackup">
                <q-item-section>
                  <q-select
                    v-model="settings.backupFrequency"
                    :options="backupFrequencyOptions"
                    label="Backup Frequency"
                    dense
                    outlined
                    emit-value
                    map-options
                    style="min-width: 150px"
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>Clear All Data</q-item-label>
                  <q-item-label caption class="text-negative">This will permanently delete all your data</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn flat color="negative" label="Clear Data" @click="confirmClearData" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Restore Backup Dialog -->
    <q-dialog v-model="restoreDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Restore from Backup</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <p class="q-mb-md">Select a backup file to restore your data.</p>

          <q-file
            v-model="backupFile"
            label="Backup File"
            outlined
            accept=".json"
            bottom-slots
            counter
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>

            <template v-slot:hint>
              Select a .json backup file
            </template>
          </q-file>

          <q-banner class="q-mt-md" rounded dense>
            <template v-slot:avatar>
              <q-icon name="warning" color="warning" />
            </template>
            Restoring from a backup will replace your current data. Make sure to create a backup of your current data first.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Restore"
            color="secondary"
            :disabled="!backupFile"
            @click="restoreFromFile"
            :loading="restoring"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Clear Data Confirmation Dialog -->
    <q-dialog v-model="clearDataDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Clear All Data?</span>
        </q-card-section>

        <q-card-section>
          <p class="q-mb-md">This will permanently delete all your data, including:</p>
          <ul>
            <li>All projects and briefings</li>
            <li>All artists and techniques</li>
            <li>All gear settings</li>
            <li>All progress tracking</li>
            <li>All tags</li>
          </ul>
          <p class="text-weight-bold">This action cannot be undone.</p>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="clearDataConfirmation"
            label="Type 'DELETE' to confirm"
            outlined
            :rules="[val => val === 'DELETE' || 'Please type DELETE to confirm']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Clear All Data"
            color="negative"
            :disabled="clearDataConfirmation !== 'DELETE'"
            @click="clearAllData"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'src/stores/settings-store';
import type { Settings } from 'src/models/settings';

const $q = useQuasar();
const settingsStore = useSettingsStore();

// Form state
const settings = reactive<Settings>({
  username: '',
  email: '',
  theme: 'light',
  defaultInstrument: '',
  aiMode: 'offline',
  apiKey: '',
  detailedBriefings: true,
  maxTokens: 2000,
  dbLocation: './data/database',
  autoBackup: false,
  backupFrequency: 'weekly'
});

// UI state
const saving = ref(false);
const savingAI = ref(false);
const backingUp = ref(false);
const restoring = ref(false);
const showApiKey = ref(false);
const restoreDialog = ref(false);
const clearDataDialog = ref(false);
const backupFile = ref<File | null>(null);
const clearDataConfirmation = ref('');

// Options
const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
];

const instrumentOptions = [
  { label: 'Guitar', value: 'guitar' },
  { label: 'Bass', value: 'bass' },
  { label: 'Drums', value: 'drums' },
  { label: 'Keyboard', value: 'keyboard' },
  { label: 'Production', value: 'production' },
  { label: 'Vocals', value: 'vocals' }
];

const aiModeOptions = [
  { label: 'Online (LangChain API)', value: 'online' },
  { label: 'Offline (Local JSON)', value: 'offline' }
];

const backupFrequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
];

interface BackupHistoryItem {
  id: number;
  date: string;
  size: string;
  items: number;
}

// Mock backup history (replace with real data from API)
const backupHistory = ref<BackupHistoryItem[]>([
  {
    id: 1,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    size: '2.3MB',
    items: 45
  },
  {
    id: 2,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    size: '2.1MB',
    items: 42
  }
]);

onMounted(async () => {
  try {
    // Load settings
    const currentSettings = await settingsStore.fetchSettings();
    Object.assign(settings, currentSettings);
  } catch {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to load settings',
      icon: 'report_problem'
    });
  }
});

// Methods
async function saveGeneralSettings() {
  try {
    saving.value = true;

    // Update only general settings
    const generalSettings: Partial<Settings> = {
      username: settings.username,
      email: settings.email,
      theme: settings.theme,
      defaultInstrument: settings.defaultInstrument
    };

    await settingsStore.updateSettings(generalSettings);

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Settings saved successfully',
      icon: 'check'
    });
  } catch {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to save settings',
      icon: 'report_problem'
    });
  } finally {
    saving.value = false;
  }
}

async function saveAISettings() {
  try {
    savingAI.value = true;

    // Update only AI settings
    const aiSettings: Partial<Settings> = {
      aiMode: settings.aiMode,
      apiKey: settings.apiKey,
      detailedBriefings: settings.detailedBriefings,
      maxTokens: settings.maxTokens
    };

    await settingsStore.updateSettings(aiSettings);

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'AI settings saved successfully',
      icon: 'check'
    });
  } catch {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to save AI settings',
      icon: 'report_problem'
    });
  } finally {
    savingAI.value = false;
  }
}

async function createBackup() {
  try {
    backingUp.value = true;

    const backupData = await settingsStore.createBackup();

    // Create downloadable file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `co-producer-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Update backup history (this would be handled by the API in a real app)
    backupHistory.value.unshift({
      id: backupHistory.value.length + 1,
      date: new Date().toISOString(),
      size: `${(blob.size / (1024 * 1024)).toFixed(1)}MB`,
      items:
        Object.keys(backupData.artists || {}).length +
        Object.keys(backupData.projects || {}).length +
        Object.keys(backupData.techniques || {}).length +
        Object.keys(backupData.gear || {}).length
    });

    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Backup created successfully',
      icon: 'check'
    });
  } catch {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to create backup',
      icon: 'report_problem'
    });
  } finally {
    backingUp.value = false;
  }
}

function openRestoreDialog() {
  backupFile.value = null;
  restoreDialog.value = true;
}

async function restoreFromFile(): Promise<void> {
  if (!backupFile.value) return;

  try {
    restoring.value = true;

    const reader = new FileReader();

    return new Promise<void>((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const backupData = JSON.parse(result);
            await settingsStore.restoreBackup(backupData);

            $q.notify({
              color: 'positive',
              position: 'top',
              message: 'Data restored successfully',
              icon: 'check'
            });

            // Close dialog
            restoreDialog.value = false;

            // Reload page to reflect changes
            setTimeout(() => {
              window.location.reload();
            }, 1000);

            resolve();
          }
        } catch {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Invalid backup file format',
            icon: 'report_problem'
          });
          reject(new Error('Failed to read backup file'));
        } finally {
          restoring.value = false;
        }
      };

      reader.onerror = () => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to read backup file',
          icon: 'report_problem'
        });
        restoring.value = false;
        reject(new Error('Failed to read backup file'));
      };

      if (backupFile.value) {
        reader.readAsText(backupFile.value);
      } else {
        restoring.value = false;
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'No backup file selected',
          icon: 'report_problem'
        });
        reject(new Error('No backup file selected'));
      }
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to restore backup',
      icon: 'report_problem'
    });
    restoring.value = false;
    throw error;
  }
}

function downloadBackup(backup: BackupHistoryItem) {
  // In a real app, this would fetch the backup file from the server
  // For this example, we'll create a mock backup file

  const mockBackupData = {
    version: '1.0',
    date: backup.date,
    settings: { ...settings },
    artists: [{ id: 'mock-artist-1', name: 'Sample Artist' }],
    projects: [{ id: 'mock-project-1', title: 'Sample Project' }],
    techniques: [{ id: 'mock-technique-1', name: 'Sample Technique' }],
    gear: [{ id: 'mock-gear-1', gear_name: 'Sample Gear' }]
  };

  const blob = new Blob([JSON.stringify(mockBackupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date(backup.date).toISOString().split('T')[0];
  a.href = url;
  a.download = `co-producer-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);

  $q.notify({
    color: 'positive',
    position: 'top',
    message: 'Backup downloaded',
    icon: 'check'
  });
}

async function restoreBackup(backup: BackupHistoryItem): Promise<void> {
  // In a real app, this would fetch the backup file from the server and restore it
  // For this example, we'll just show a notification

  return new Promise<void>((resolve, reject) => {
    $q.dialog({
      title: 'Restore backup?',
      message: `Are you sure you want to restore the backup from ${formatDate(backup.date)}?`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      try {
        $q.loading.show({
          message: 'Restoring backup...'
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        $q.loading.hide();
        $q.notify({
          color: 'positive',
          position: 'top',
          message: 'Backup restored successfully',
          icon: 'check'
        });

        // Reload page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        resolve();
      } catch {
        $q.loading.hide();
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to restore backup',
          icon: 'report_problem'
        });
        reject(new Error('Failed to restore backup'));
      }
    }).onCancel(() => {
      resolve();
    });
  });
}

function selectDatabaseLocation() {
  // This would typically open a file dialog in a desktop app
  // For a web app, we'll just show a notification

  $q.notify({
    color: 'info',
    position: 'top',
    message: 'Database location can only be changed in the desktop version',
    icon: 'info'
  });
}

function confirmClearData() {
  clearDataConfirmation.value = '';
  clearDataDialog.value = true;
}

async function clearAllData() {
  try {
    $q.loading.show({
      message: 'Clearing all data...'
    });

    // Call API to clear all data
    await settingsStore.clearAllData();

    $q.loading.hide();
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'All data cleared successfully',
      icon: 'check'
    });

    // Reload page to reflect changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch {
    $q.loading.hide();
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Failed to clear data',
      icon: 'report_problem'
    });
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>
