// Core entity types

use std::collections::HashMap;
use chrono::{DateTime, Utc};

struct Artist {
    id: String,
    name: String,
    band: Option<String>,
    era: Option<String>,
    description: String,
    instrument: String, // "guitar", "bass", "producer", etc.
    difficulty: String, // "easy", "moderate", "challenging"
    tags: Vec<String>,
    techniques: Vec<Technique>,
    gear_settings: Vec<GearSetting>,
    media: Vec<Media>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

struct Technique {
    id: String,
    name: String,
    description: String,
    difficulty: u8, // 1-5
    tab_notation: Option<String>,
    instructions: String,
    progress: ProgressStatus, // User's progress on this technique
}

struct GearSetting {
    gear_type: String, // "amp", "pedal", "instrument", etc.
    gear_name: String,
    settings: HashMap<String, String>, // Setting name -> value
    description: String,
}

struct Media {
    media_type: String, // "youtube", "image", "audio"
    title: String,
    url: String,
    description: Option<String>,
}

enum ProgressStatus {
    NotStarted,
    InProgress,
    Mastered,
}

struct Project {
    id: String,
    title: String,
    description: String,
    collaborators: Vec<String>, // Artist IDs
    equipment: Vec<String>, // GearSetting IDs
    creative_directives: Vec<String>,
    workflow_notes: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

struct BriefingPack {
    project: Project,
    virtual_collaborators: Vec<Artist>,
    equipment_selection: HashMap<String, Vec<GearSetting>>,
    creative_directives: Vec<String>,
    workflow_preferences: HashMap<String, String>,
}