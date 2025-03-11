use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::{Html, IntoResponse, Response},
    Form,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::AppError;
use crate::utils::app_state::AppState;
use crate::template;

// Home page
pub async fn home_page(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    // Get theme preference from cookie
    let theme = get_theme_from_headers(&headers);

    // Render the home page template
    let html = crate::template::render(
        "index.html",
        &serde_json::json!({
            "theme": theme
        }),
    )?;

    Ok(Html(html))
}

// Dashboard page
pub async fn dashboard(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    // Get theme preference from cookie
    let theme = get_theme_from_headers(&headers);

    // In a real app, fetch this data from the database
    let stats = serde_json::json!({
        "project_count": 5,
        "artist_count": 12,
        "technique_count": 45,
        "mastered_techniques": 15,
        "mastered_percentage": 33
    });

    let recent_projects = vec![
        serde_json::json!({
            "id": "1",
            "title": "Blues Guitar Study",
            "description": "Exploring classic blues guitar techniques and styles",
            "updated_at": "2023-03-01T12:00:00Z",
            "has_briefing": true
        }),
        serde_json::json!({
            "id": "2",
            "title": "Jazz Chord Progressions",
            "description": "Working with complex jazz harmony and voicings",
            "updated_at": "2023-02-15T10:30:00Z",
            "has_briefing": false
        }),
        serde_json::json!({
            "id": "3",
            "title": "Funk Bass Lines",
            "description": "Creating groovy funk bass lines with syncopation",
            "updated_at": "2023-01-20T15:45:00Z",
            "has_briefing": true
        })
    ];

    let recent_techniques = vec![
        serde_json::json!({
            "id": "101",
            "name": "Blues Shuffle",
            "artist_name": "Stevie Ray Vaughan",
            "progress": {
                "status": "Mastered"
            }
        }),
        serde_json::json!({
            "id": "102",
            "name": "String Bending",
            "artist_name": "B.B. King",
            "progress": {
                "status": "InProgress"
            }
        }),
        serde_json::json!({
            "id": "103",
            "name": "Fingerstyle Picking",
            "artist_name": "Mark Knopfler",
            "progress": {
                "status": "NotStarted"
            }
        })
    ];

    let activities = vec![
        serde_json::json!({
            "id": 1,
            "title": "Project Created",
            "description": "Created new project \"Blues Guitar Study\"",
            "timestamp": "2023-03-01T12:00:00Z",
            "icon": "folder-plus",
            "color": "var(--bs-primary)"
        }),
        serde_json::json!({
            "id": 2,
            "title": "Briefing Generated",
            "description": "Generated AI briefing for the project",
            "timestamp": "2023-03-01T12:15:00Z",
            "icon": "file-text",
            "color": "var(--bs-secondary)"
        }),
        serde_json::json!({
            "id": 3,
            "title": "Technique Mastered",
            "description": "Mastered technique \"Blues Shuffle\"",
            "timestamp": "2023-03-02T10:00:00Z",
            "icon": "check-circle",
            "color": "var(--bs-success)"
        })
    ];

    // Render the dashboard template
    let html = crate::template::render(
        "dashboard/index.html",
        &serde_json::json!({
            "active_page": "dashboard",
            "theme": theme,
            "stats": stats,
            "recent_projects": recent_projects,
            "recent_techniques": recent_techniques,
            "activities": activities
        }),
    )?;

    Ok(Html(html))
}

// Settings page
pub async fn get_settings(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    // Get theme preference from cookie
    let theme = get_theme_from_headers(&headers);

    // In a real app, fetch settings from the database
    let settings = serde_json::json!({
        "username": "Test User",
        "email": "test@example.com",
        "theme": theme,
        "defaultInstrument": "guitar",
        "aiMode": "offline",
        "apiKey": "",
        "detailedBriefings": true,
        "maxTokens": 2000,
        "dbLocation": "./data/database",
        "autoBackup": false,
        "backupFrequency": "weekly"
    });

    // Render the settings template - for now, use dashboard as we don't have a settings template yet
    let html = crate::template::render(
        "dashboard/index.html", // Change back to "settings/index.html" once created
        &serde_json::json!({
            "active_page": "settings",
            "theme": theme,
            "settings": settings
        }),
    )?;

    Ok(Html(html))
}

// Update settings
pub async fn update_settings(
    State(state): State<AppState>,
    Form(settings): Form<HashMap<String, String>>,
) -> Result<impl IntoResponse, AppError> {
    // In a real app, update settings in the database

    // Redirect to settings page
    Ok(Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header("Location", "/settings")
        .body(axum::body::Body::from(""))
        .unwrap())
}

// Create backup
pub async fn create_backup(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    // In a real app, create a backup of the database

    // Return JSON response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(axum::body::Body::from(
            serde_json::to_string(&serde_json::json!({
                "success": true,
                "message": "Backup created successfully"
            }))
                .unwrap(),
        ))
        .unwrap())
}

// Restore backup
pub async fn restore_backup(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    // In a real app, restore a backup of the database

    // Return JSON response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(axum::body::Body::from(
            serde_json::to_string(&serde_json::json!({
                "success": true,
                "message": "Backup restored successfully"
            }))
                .unwrap(),
        ))
        .unwrap())
}

// Toggle theme preference
#[derive(Deserialize)]
pub struct ThemeToggle {
    dark_mode: Option<String>,
}

pub async fn toggle_theme(
    Form(form): Form<ThemeToggle>,
) -> Result<impl IntoResponse, AppError> {
    // The form checkbox will be present if checked (dark mode)
    let theme = if form.dark_mode.is_some() { "dark" } else { "light" };

    // Set cookie and return empty response
    let response = Response::builder()
        .status(StatusCode::OK)
        .header("Set-Cookie", format!("theme={}; Path=/; Max-Age=31536000", theme))
        .body(axum::body::Body::from(""))
        .unwrap();

    Ok(response)
}

// Helper function to get theme preference from headers
fn get_theme_from_headers(headers: &HeaderMap) -> String {
    if let Some(cookie) = headers.get("Cookie") {
        if let Ok(cookie_str) = cookie.to_str() {
            for cookie_part in cookie_str.split(';') {
                let cookie_part = cookie_part.trim();
                if cookie_part.starts_with("theme=") {
                    let theme = cookie_part.split('=').nth(1).unwrap_or("light");
                    if theme == "dark" {
                        return "dark".to_string();
                    }
                }
            }
        }
    }

    // Default to light theme
    "light".to_string()
}