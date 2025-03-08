import type { ProgressStatus } from './progress';

export interface Technique {
  id: string;
  artist_id: string;
  artist_name?: string; // For display purposes
  name: string;
  description: string;
  difficulty: number; // 1-5
  tab_notation?: string;
  instructions: string;
  progress?: ProgressStatus;
}
