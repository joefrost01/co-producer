// src/models/index.ts
// This file exports all models for easy importing

export * from './artist';
export * from './technique';
export * from './gear';
export * from './project';
export * from './progress';
export * from './common';

// src/models/artist.ts
import { Technique } from './technique';
import { GearSetting } from './gear';
import { Media } from './common';

export interface Artist {
  id: string;
  name: string;
  band?: string;
  era?: string;
  description: string;
  instrument: string;
  difficulty: string; // 'easy', 'moderate', 'challenging'
  tags: string[];
  techniques: Technique[];
  gear_settings: GearSetting[];
  media: Media[];
  created_at: string;
  updated_at: string;
}
