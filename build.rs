use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    // Check if this is a release build
    let is_release = env::var("PROFILE").unwrap_or_default() == "release";

    // Only build and bundle the frontend for release builds
    if is_release {
        // For release builds, always rebuild the frontend
        // We don't use rerun-if-changed here as we want to ensure the frontend is always built

        // Build the Vue project in release mode
        let status = Command::new("npm")
            .args(&["run", "build"])
            .current_dir("frontend")
            .status()
            .expect("Failed to build the frontend using npm");

        if !status.success() {
            panic!("Frontend build failed");
        }

        // Define paths
        let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
        let static_dir = Path::new(&manifest_dir).join("static");

        // Clean and recreate the static directory
        if static_dir.exists() {
            fs::remove_dir_all(&static_dir).expect("Failed to clean static directory");
        }
        fs::create_dir_all(&static_dir).expect("Failed to create static directory");

        // Copy all files from Vue's dist folder to our static directory
        copy_dir_contents(
            Path::new("frontend/dist"),
            &static_dir
        ).expect("Failed to copy frontend dist files");

        println!("Successfully bundled Vue frontend for release build");
    } else {
        println!("Development build: Use 'npm run dev' in the frontend directory for local development");
    }
}

// Helper function to recursively copy directory contents
fn copy_dir_contents(src: &Path, dst: &Path) -> std::io::Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if file_type.is_dir() {
            copy_dir_contents(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}