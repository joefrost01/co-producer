use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Template error: {0}")]
    Template(#[from] minijinja::Error),

    #[error("Database error: {0}")]
    Database(#[from] surrealdb::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

// Map AppError to an HTTP response
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::Template(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::InvalidInput(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::Forbidden(msg) => (StatusCode::FORBIDDEN, msg.clone()),
            AppError::Other(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        };

        // In a real application, you'd want to log the error here
        tracing::error!("Application error: {}: {}", status, error_message);

        // If it's a non-JSON request or if HX-Request header is present,
        // return a user-friendly HTML error page
        let hx_request = false; // In a real implementation, extract this from the request headers

        if hx_request {
            // For HTMX requests, return an error message that can be inserted directly
            (status, error_message).into_response()
        } else {
            // For regular requests, render an error page
            // In a real implementation, you'd render a proper error template
            (
                status,
                format!(
                    r#"<!DOCTYPE html>
                    <html>
                    <head><title>Error</title></head>
                    <body>
                        <h1>Error: {}</h1>
                        <p>{}</p>
                        <p><a href="/">Back to Home</a></p>
                    </body>
                    </html>"#,
                    status.as_u16(),
                    error_message
                ),
            )
                .into_response()
        }
    }
}

// Helper to easily create NotFound errors
pub fn not_found<T: Into<String>>(msg: T) -> AppError {
    AppError::NotFound(msg.into())
}

// Helper to easily create InvalidInput errors
pub fn invalid_input<T: Into<String>>(msg: T) -> AppError {
    AppError::InvalidInput(msg.into())
}

// Helper to easily create Internal errors
pub fn internal_error<T: Into<String>>(msg: T) -> AppError {
    AppError::Internal(msg.into())
}