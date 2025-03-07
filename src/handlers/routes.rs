use axum::{
    extract::{Path, State},
    response::{IntoResponse, Response},
    routing::{get, post, put, delete},
    Router,
};
use rust_embed::RustEmbed;
use crate::Pool;

#[derive(RustEmbed)]
#[folder = "static/"] // Your Vue build output
struct Assets;

async fn static_handler(uri: axum::http::Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/');
    let path = if path.is_empty() { "index.html" } else { path };

    match Assets::get(path) {
        Some(content) => {
            // Determine content type based on file extension
            let content_type = match path.split('.').last() {
                Some("html") => "text/html",
                Some("js") => "application/javascript",
                Some("css") => "text/css",
                Some("png") => "image/png",
                Some("jpg") | Some("jpeg") => "image/jpeg",
                Some("svg") => "image/svg+xml",
                Some("json") => "application/json",
                Some("woff") => "font/woff",
                Some("woff2") => "font/woff2",
                Some("ttf") => "font/ttf",
                Some("otf") => "font/otf",
                Some("eot") => "application/vnd.ms-fontobject",
                _ => "application/octet-stream",
            };

            Response::builder()
                .header("content-type", content_type)
                .body(axum::body::Body::from(content.data))
                .unwrap()
        }
        None => {
            // For SPA routing, return index.html for routes that don't match static files
            if !path.contains('.') {
                match Assets::get("index.html") {
                    Some(content) => {
                        return Response::builder()
                            .header("content-type", "text/html")
                            .body(axum::body::Body::from(content.data))
                            .unwrap();
                    }
                    None => {}
                }
            }

            // If we got here, the file doesn't exist and it's not an SPA route
            Response::builder()
                .status(404)
                .body(axum::body::Body::from("Not found"))
                .unwrap()
        }
    }
}

// Define your handler functions with the proper state type
async fn get_dashboard(State(_db): State<Pool>) -> impl IntoResponse {
    // Implementation
    "Dashboard data" // Placeholder
}

async fn get_artists(State(_db): State<Pool>) -> impl IntoResponse {
    // Implementation
    "Artists data" // Placeholder
}

async fn create_artist(State(_db): State<Pool>) -> impl IntoResponse {
    // Implementation
    "Artist created" // Placeholder
}

async fn get_artist(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    // Implementation
    format!("Artist details for {}", id) // Placeholder
}

async fn update_artist(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    // Implementation
    format!("Artist updated for {}", id) // Placeholder
}

async fn delete_artist(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    // Implementation
    format!("Artist deleted for {}", id) // Placeholder
}

// Similarly define the rest of your handler functions with State extraction
// For brevity, I'll just include placeholders with updated signatures

async fn get_technique(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Technique {}", id)
}
async fn update_technique(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Updated technique {}", id)
}
async fn delete_technique(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Deleted technique {}", id)
}
async fn create_technique(State(_db): State<Pool>) -> impl IntoResponse { "Created technique" }
async fn update_technique_progress(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Updated progress for technique {}", id)
}
async fn get_gear(State(_db): State<Pool>) -> impl IntoResponse { "All gear" }
async fn create_gear(State(_db): State<Pool>) -> impl IntoResponse { "Created gear" }
async fn get_gear_item(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Gear item {}", id)
}
async fn update_gear(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Updated gear {}", id)
}
async fn delete_gear(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Deleted gear {}", id)
}
async fn get_projects(State(_db): State<Pool>) -> impl IntoResponse { "All projects" }
async fn create_project(State(_db): State<Pool>) -> impl IntoResponse { "Created project" }
async fn get_project(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Project {}", id)
}
async fn update_project(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Updated project {}", id)
}
async fn delete_project(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Deleted project {}", id)
}
async fn generate_briefing(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Generated briefing for project {}", id)
}
async fn get_briefing(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Briefing for project {}", id)
}
async fn get_briefing_markdown(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Markdown briefing for project {}", id)
}
async fn get_briefing_json(Path(id): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("JSON briefing for project {}", id)
}
async fn get_progress(State(_db): State<Pool>) -> impl IntoResponse { "Progress data" }
async fn get_tags(State(_db): State<Pool>) -> impl IntoResponse { "All tags" }
async fn create_tag(State(_db): State<Pool>) -> impl IntoResponse { "Created tag" }
async fn delete_tag(Path(name): Path<String>, State(_db): State<Pool>) -> impl IntoResponse {
    format!("Deleted tag {}", name)
}
async fn merge_tags(State(_db): State<Pool>) -> impl IntoResponse { "Merged tags" }
async fn get_settings(State(_db): State<Pool>) -> impl IntoResponse { "Settings" }
async fn update_settings(State(_db): State<Pool>) -> impl IntoResponse { "Updated settings" }
async fn create_backup(State(_db): State<Pool>) -> impl IntoResponse { "Created backup" }
async fn restore_backup(State(_db): State<Pool>) -> impl IntoResponse { "Restored backup" }

// Remove async from this function
pub fn create_router() -> Router<Pool> {
    let api_routes = Router::new()
        // Dashboard
        .route("/dashboard", get(get_dashboard))

        // Artists
        .route("/artists", get(get_artists).post(create_artist))
        .route("/artists/{id}",
               get(get_artist)
                   .put(update_artist)
                   .delete(delete_artist))

        // Techniques
        .route("/techniques/{id}",
               get(get_technique)
                   .put(update_technique)
                   .delete(delete_technique))
        .route("/techniques", post(create_technique))
        .route("/techniques/{id}/progress", put(update_technique_progress))

        // Gear
        .route("/gear", get(get_gear).post(create_gear))
        .route("/gear/{id}",
               get(get_gear_item)
                   .put(update_gear)
                   .delete(delete_gear))

        // Projects
        .route("/projects", get(get_projects).post(create_project))
        .route("/projects/{id}",
               get(get_project)
                   .put(update_project)
                   .delete(delete_project))
        .route("/projects/{id}/generate-briefing", post(generate_briefing))
        .route("/projects/{id}/briefing", get(get_briefing))
        .route("/projects/{id}/briefing/markdown", get(get_briefing_markdown))
        .route("/projects/{id}/briefing/json", get(get_briefing_json))

        // Progress
        .route("/progress", get(get_progress))

        // Tags
        .route("/tags", get(get_tags).post(create_tag))
        .route("/tags/{name}", delete(delete_tag))
        .route("/tags/merge", post(merge_tags))

        // Settings
        .route("/settings", get(get_settings).put(update_settings))
        .route("/backup", post(create_backup))
        .route("/restore", post(restore_backup));

    // Combine API routes with SPA handler
    Router::new()
        .nest("/api", api_routes)
        .fallback(static_handler)
}
