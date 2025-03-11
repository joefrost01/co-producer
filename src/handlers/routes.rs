use axum::{
    Router,
    routing::{get, post, put, delete},
    extract::{Path, State},
};
use rust_embed::RustEmbed;
use tower_http::{
    services::ServeDir,
    trace::TraceLayer,
};
use std::sync::Arc;

use crate::handlers::{
    dashboard_handler,
    artist_handler,
    technique_handler,
    gear_handler,
    project_handler,
    progress_handler,
    tag_handler,
};
use crate::utils::app_state::AppState;

#[derive(RustEmbed)]
#[folder = "static/"]
struct StaticAssets;

pub fn create_router(state: AppState) -> Router {
    // Serve static files
    let static_service = ServeDir::new("static");

    // Create the main router
    Router::new()
        // Dashboard routes
        .route("/", get(dashboard_handler::home_page))
        .route("/dashboard", get(dashboard_handler::dashboard))

        // Artist routes
        // .route("/artists", get(artist_handler::list_artists)
        //     .post(artist_handler::create_artist))
        // .route("/artists/new", get(artist_handler::new_artist_form))
        // .route("/artists/:id", get(artist_handler::get_artist)
        //     .put(artist_handler::update_artist)
        //     .delete(artist_handler::delete_artist))
        // .route("/artists/:id/edit", get(artist_handler::edit_artist_form))

        // Technique routes
        // .route("/techniques", get(technique_handler::list_techniques))
        // .route("/techniques/:id", get(technique_handler::get_technique)
        //     .put(technique_handler::update_technique)
        //     .delete(technique_handler::delete_technique))
        // .route("/techniques/update-progress", put(technique_handler::update_progress))
        // .route("/techniques/add-to-plan", post(technique_handler::add_to_plan))

        // Project routes
        // .route("/projects", get(project_handler::list_projects)
        //     .post(project_handler::create_project))
        // .route("/projects/new", get(project_handler::new_project_form))
        // .route("/projects/:id", get(project_handler::get_project)
        //     .put(project_handler::update_project)
        //     .delete(project_handler::delete_project))
        // .route("/projects/:id/edit", get(project_handler::edit_project_form))
        // .route("/projects/:id/generate-briefing", post(project_handler::generate_briefing))

        // Gear routes
        // .route("/gear", get(gear_handler::list_gear)
        //     .post(gear_handler::create_gear))
        // .route("/gear/new", get(gear_handler::new_gear_form))
        // .route("/gear/:id", get(gear_handler::get_gear)
        //     .put(gear_handler::update_gear)
        //     .delete(gear_handler::delete_gear))
        // .route("/gear/:id/edit", get(gear_handler::edit_gear_form))

        // Progress routes
        // .route("/progress", get(progress_handler::get_progress))

        // Tag routes
        // .route("/tags", get(tag_handler::list_tags)
        //     .post(tag_handler::create_tag))
        // .route("/tags/:name", delete(tag_handler::delete_tag))
        // .route("/tags/merge", post(tag_handler::merge_tags))

        // Settings routes
        .route("/settings", get(dashboard_handler::get_settings)
            .put(dashboard_handler::update_settings))
        .route("/backup", post(dashboard_handler::create_backup))
        .route("/restore", post(dashboard_handler::restore_backup))

        // Theme toggle route
        .route("/toggle-theme", post(dashboard_handler::toggle_theme))

        // Add the application state
        .with_state(state)

        // Add tracing layer for logging
        .layer(TraceLayer::new_for_http())

        // Serve static files
        .nest_service("/static", static_service)
}