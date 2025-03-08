import type { Router } from 'vue-router'


export function formatDate(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function getDifficultyColor(level: number | string) {
  const numLevel = typeof level === 'string' ? parseInt(level) : level;
  switch (numLevel) {
    case 1: return 'green';
    case 2: return 'light-green';
    case 3: return 'amber';
    case 4: return 'orange';
    case 5: return 'red';
    default: return 'grey';
  }
}

// export function handleError(error: unknown, $q: unknown, message: string = 'An error occurred'): void {
//   // Log the error for debugging but don't reference it directly in UI
//   console.error('Error:', error);
//
//   $q.notify({
//     color: 'negative',
//     position: 'top',
//     message,
//     icon: 'report_problem'
//   });
// }

export async function safeNavigate(router: Router, path: string): Promise<void> {
  try {
    await router.push(path);
  } catch (error) {
    console.error('Navigation error:', error);
    // Navigation errors are usually handled by Vue Router
    // and don't need explicit user notification
  }
}

