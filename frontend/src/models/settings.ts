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
  artists: any[];
  projects: any[];
  techniques: any[];
  gear: any[];
  [key: string]: any;
}
