export interface ProgressStatus {
  status: string; // 'NotStarted', 'InProgress', 'Mastered'
  started_at?: string | undefined;
  completed_at?: string | undefined;
  notes?: string | undefined;
  updated_at?: string | undefined;
}

export interface LearningPlanItem {
  id: string;
  technique_id: string;
  target_date: string;
  notes?: string;
  priority?: string; // 'high', 'medium', 'low'
  created_at?: string;
}

export interface ProgressStats {
  total: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteredPercentage: number;
  inProgressPercentage: number;
  notStartedPercentage: number;
}
