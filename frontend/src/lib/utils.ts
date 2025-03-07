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
