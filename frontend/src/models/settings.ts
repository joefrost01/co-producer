export interface Settings {
  username: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
  defaultInstrument: string;
  aiMode: 'online' | 'offline';
  apiKey: string;
  detailedBriefings: boolean;
  maxTokens: number;
  dbLocation: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface BackupData {
  version: string;
  date: string;
  settings: Settings;
  artists: Record<string, unknown>[];  // More specific than any[]
  projects: Record<string, unknown>[];
  techniques: Record<string, unknown>[];
  gear: Record<string, unknown>[];
  [key: string]: unknown;  // More specific than any
}
