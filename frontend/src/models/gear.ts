export interface GearItem {
  id: string;
  gear_type: string;
  gear_name: string;
  settings: Record<string, string>;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface GearSetting {
  gear_type: string;
  gear_name: string;
  settings: Record<string, string>;
  description: string;
}
