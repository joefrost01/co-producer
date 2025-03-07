
use surrealdb::Surreal;
use std::path::Path;
use surrealdb::engine::local::RocksDb;
use surrealdb::error::Db;

pub async fn setup_database() -> Result<Surreal<Db>, surrealdb::Error> {
    // Define the path for database storage
    let db_path = Path::new("./data/database");

    // Create the directory if it doesn't exist
    std::fs::create_dir_all(db_path).expect("Failed to create database directory");

    // Connect to the database using RocksDB as the storage engine
    let db = Surreal::new::<RocksDb>(db_path).await?;

    // Optionally: Select a specific namespace and database
    db.use_ns("my_namespace").use_db("my_database").await?;

    // You could add initial setup here if needed:
    // - Create schemas
    // - Set up permissions
    // - Create initial data

    println!("SurrealDB started with disk storage at {:?}", db_path);

    Ok(db)
}