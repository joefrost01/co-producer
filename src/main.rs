mod handlers;
mod model;

use std::path::Path;
use crate::handlers::routes::create_router;
use async_trait::async_trait;
use deadpool::managed;
use surrealdb::engine::local::{Db, RocksDb};
use surrealdb::{Error, Surreal};

// DB connection manager
struct Manager {
    db_path: String,
}

#[async_trait]
impl managed::Manager for Manager {
    type Type = Surreal<Db>;
    type Error = Error;

    async fn create(&self) -> Result<Self::Type, Self::Error> {
        let db_path = Path::new(&self.db_path);

        // Create directory if it doesn't exist
        std::fs::create_dir_all(db_path).expect("Failed to create database directory");

        // Connect using RocksDb as the engine, but the connection type is Db
        let db = Surreal::new::<RocksDb>(db_path).await?;

        // Set namespace and database
        db.use_ns("my_namespace").use_db("my_database").await?;

        Ok(db)
    }

    async fn recycle(&self, _conn: &mut Self::Type, _metrics: &deadpool::managed::Metrics) -> managed::RecycleResult<Self::Error> {
        Ok(())
    }
}

// Pool type definition
pub type Pool = managed::Pool<Manager>;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the connection pool
    let manager = Manager {
        db_path: "./data/database".to_string(),
    };

    let pool = Pool::builder(manager)
        .max_size(16)
        .build()?;

    // Create the router with the database state
    let app = create_router().with_state(pool);

    // Start the server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    println!("Server running at http://0.0.0.0:3000");
    axum::serve(listener, app).await?;

    Ok(())
}