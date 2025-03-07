use axum::{
    response::{IntoResponse, Response},
    routing::{get, post, put, delete},
    Router,
};
use rust_embed::RustEmbed;
use std::path::PathBuf;

#[derive(RustEmbed)]
#[folder = "static/"] // Your Vue build output
struct Assets;

async fn static_handler(path: PathBuf) -> impl IntoResponse {
    let path = path.display().to_string();
    let path = if path.is_empty() { "index.html".to_string() } else { path };

    match Assets::get(&path) {
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
                _ => "application/octet-stream",
            };

            Response::builder()
                .header("content-type", content_type)
                .body(content.data.into())
                .unwrap()
        }
        None => {
            // Return index.html for any path that doesn't match a static file
            // This enables SPA routing
            match Assets::get("index.html") {
                Some(content) => Response::builder()
                    .header("content-type", "text/html")
                    .body(content.data.into())
                    .unwrap(),
                None => Response::builder()
                    .status(404)
                    .body("Not found".into())
                    .unwrap(),
            }
        }
    }
}



async fn create_router() -> Router {
    let api_routes = Router::new()
        // Dashboard
        .route("/dashboard", get(get_dashboard))

        // Artists
        .route("/artists", get(get_artists).post(create_artist))
        .route("/artists/:id",
               get(get_artist)
                   .put(update_artist)
                   .delete(delete_artist))

        // Techniques
        .route("/techniques/:id",
               get(get_technique)
                   .put(update_technique)
                   .delete(delete_technique))
        .route("/techniques", post(create_technique))
        .route("/techniques/:id/progress", put(update_technique_progress))

        // Gear
        .route("/gear", get(get_gear).post(create_gear))
        .route("/gear/:id",
               get(get_gear_item)
                   .put(update_gear)
                   .delete(delete_gear))

        // Projects
        .route("/projects", get(get_projects).post(create_project))
        .route("/projects/:id",
               get(get_project)
                   .put(update_project)
                   .delete(delete_project))
        .route("/projects/:id/generate-briefing", post(generate_briefing))
        .route("/projects/:id/briefing", get(get_briefing))
        .route("/projects/:id/briefing/markdown", get(get_briefing_markdown))
        .route("/projects/:id/briefing/json", get(get_briefing_json))

        // Progress
        .route("/progress", get(get_progress))

        // Tags
        .route("/tags", get(get_tags).post(create_tag))
        .route("/tags/:name", delete(delete_tag))
        .route("/tags/merge", post(merge_tags))

        // Settings
        .route("/settings", get(get_settings).put(update_settings))
        .route("/backup", post(create_backup))
        .route("/restore", post(restore_backup));

    // Combine API routes with SPA handler
    Router::new()
        .nest("/api", api_routes)
        .merge(spa_routes())
}

// In your main.rs or routes module
pub fn spa_routes() -> Router {
    Router::new()
        .route("/*path", get(static_handler))
}