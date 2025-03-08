export interface Project {
  id: string;
  title: string;
  description: string;
  collaborators: string[]; // Artist IDs
  equipment: string[]; // GearItem IDs
  creative_directives: string[];
  workflow_notes: string;
  created_at: string;
  updated_at: string;
  has_briefing?: boolean;
  tags?: string[];

  // Add index signature to satisfy Record<string, unknown>
  [key: string]: unknown;
}

export interface Briefing {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
