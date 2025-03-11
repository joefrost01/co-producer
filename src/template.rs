use minijinja::Environment;
use once_cell::sync::Lazy;
use serde::Serialize;
use std::path::Path;
use std::sync::Mutex;

// Use a Mutex to allow template reloading
static TEMPLATES: Lazy<Mutex<Environment<'static>>> = Lazy::new(|| {
    let env = setup_environment();
    Mutex::new(env)
});

pub fn setup_environment() -> Environment<'static> {
    let mut env = Environment::new();

    // Set up the template source from the templates directory
    env.set_loader(minijinja::path_loader(Path::new("templates")));

    // Set some global functions or filters if needed
    // env.add_filter("format_date", ...);

    env
}

pub fn init_templates() {
    // Initial setup is done through the Lazy static
    tracing::info!("Template system initialized");
}

pub fn reload_templates() {
    let mut env_lock = TEMPLATES.lock().unwrap();
    *env_lock = setup_environment();
    tracing::info!("Templates reloaded");
}

pub fn render<T: Serialize>(template_name: &str, context: &T) -> Result<String, minijinja::Error> {
    // Always reload templates in development mode
    #[cfg(debug_assertions)]
    reload_templates();

    let env_lock = TEMPLATES.lock().unwrap();
    let template = env_lock.get_template(template_name)?;
    template.render(context)
}