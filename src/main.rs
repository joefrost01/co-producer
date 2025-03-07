mod db;
mod handlers;
mod model;

use crate::handlers::routes::create_router;
use std::sync::Arc;
use async_trait::async_trait;
use deadpool::managed;
use surrealdb::engine::remote::ws::{Client, Ws};
use surrealdb::{Error, Surreal};
use surrealdb::opt::auth::Root;

// DB connection manager
struct Manager;

#[async_trait]
impl managed::Manager for Manager {
    type Type = Surreal<Client>;
    type Error = Error;

    async fn create(&self) -> Result<Self::Type, Self::Error> {
        let db = Surreal::new::<Ws>("127.0.0.1:8080").await?;
        db.signin(Root {
            username: "root",
            password: "root",
        })
        .await?;
        db.use_ns("test").use_db("test").await?;
        Ok(db)
    }

    async fn recycle(&self, _conn: &mut Self::Type) -> managed::RecycleResult<Self::Error> {
        Ok(())
    }
}

// Pool type definition
pub type Pool = managed::Pool<Manager>;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the connection pool
    let manager = Manager;
    let pool = Pool::builder(manager)
        .max_size(16)
        .build()?;

    // Share the pool with Arc
    let pool = Arc::new(pool);

    // Create the router with the database state
    let app = create_router().with_state(pool);

    // Start the server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    println!("Server running at http://0.0.0.0:3000");
    axum::serve(listener, app).await?;

    Ok(())
}