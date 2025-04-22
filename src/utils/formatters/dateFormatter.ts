/**
 * Formats a date string into a readable format
 * @param dateString - The date string to format
 * @param format - Optional format specifier ('short', 'long', 'relative')
 * @returns The formatted date string
 */
export const formatDate = (dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
      
    case 'long':
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
      
    case 'relative':
      return getRelativeTimeString(date);
      
    default:
      return new Intl.DateTimeFormat('en-US').format(date);
  }
};

/**
 * Formats a date as a relative time string (e.g., "2 days ago")
 * @param date - The date to format
 * @returns A relative time string
 */
export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return 'Just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    // If more than a month, return the formatted date
    return formatDate(date.toISOString(), 'short');
  }
};
