export interface Media {
  media_type: string; // 'youtube', 'image', 'audio'
  title: string;
  url: string;
  description?: string;
}

export interface ActivityItem {
  id?: string;
  type: string;
  timestamp: string;
  technique_id?: string;
  technique_name?: string;
  artist_id?: string;
  artist_name?: string;
  status?: string | undefined;  // Make explicitly optional with undefined
  notes?: string | undefined;   // Make explicitly optional with undefined
  plan_id?: string;
  target_date?: string | undefined;  // Make explicitly optional with undefined
  priority?: string | undefined;     // Make explicitly optional with undefined
}

export interface ColumnDefinition {
  name: string;            // Making name required to match q-table's expectations
  label: string;
  align?: 'left' | 'right' | 'center';
  field: string | ((row: Record<string, unknown>) => unknown);
  format?: (val: unknown) => string;   // Use unknown for value type to be safer
  sortable?: boolean;
  sort?: (a: unknown, b: unknown, rowA: unknown, rowB: unknown) => number;
  required?: boolean;
  classes?: string;
  style?: string;
  headerStyle?: string;
  headerClasses?: string;
}

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

export interface SelectOption {
  label: string;
  value: string | number;
}
