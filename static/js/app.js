// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle listener (also handled by HTMX on the server side)
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', function() {
      // This updates the UI immediately while the server processes the request
      document.documentElement.setAttribute('data-bs-theme', this.checked ? 'dark' : 'light');
    });
  }

  // Enable all tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize any toasts
  const toastElList = [].slice.call(document.querySelectorAll('.toast'));
  toastElList.map(function(toastEl) {
    return new bootstrap.Toast(toastEl);
  });
});

// Toast message function
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  // Toast content
  toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  // Add to container
  toastContainer.appendChild(toastEl);

  // Initialize and show
  const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
  toast.show();

  // Remove after hiding
  toastEl.addEventListener('hidden.bs.toast', function() {
    toastEl.remove();
  });
}

// HTMX events
document.addEventListener('htmx:afterSwap', function(evt) {
  // Re-initialize tooltips after content swap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Handle form errors
document.addEventListener('htmx:responseError', function(evt) {
  showToast('An error occurred: ' + evt.detail.error, 'danger');
});

// Listen for custom success messages
document.addEventListener('showMessage', function(evt) {
  const detail = evt.detail || {};
  showToast(detail.message || 'Operation successful', detail.type || 'success');
});