import type { Technique } from 'src/models/technique'
import type { GearSetting } from 'src/models/gear'
import type { Media } from 'src/models/common'

export interface Artist {
  id: string;
  name: string;
  band?: string;
  era?: string;
  description: string;
  instrument: string;
  difficulty: string;
  tags: string[];
  techniques: Technique[];
  gear_settings: GearSetting[];
  media: Media[];
  created_at: string;
  updated_at: string;
}
