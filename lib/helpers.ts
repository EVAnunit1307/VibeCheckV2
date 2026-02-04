import { 
  format, 
  formatDistanceToNow, 
  isToday, 
  isTomorrow, 
  isThisWeek, 
  isYesterday, 
  parseISO 
} from 'date-fns';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns formatted string like "2.3 miles"
 */
export function formatDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): string {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 0.1) {
    return '< 0.1 miles';
  }

  return `${distance.toFixed(1)} miles`;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format event date with smart relative formatting
 */
export function formatEventDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const time = format(date, 'h:mm a');

    if (isToday(date)) {
      return `Today at ${time}`;
    }

    if (isTomorrow(date)) {
      return `Tomorrow at ${time}`;
    }

    if (isThisWeek(date)) {
      return format(date, `EEEE 'at' h:mm a`); // "Friday at 9:00 PM"
    }

    return format(date, `MMM d 'at' h:mm a`); // "Feb 7 at 9:00 PM"
  } catch (error) {
    console.error('Error formatting event date:', error);
    return dateString;
  }
}

/**
 * Format relative time for chat messages
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Just now (< 1 minute)
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Minutes ago (< 1 hour)
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }

    // Hours ago (< 24 hours)
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Yesterday
    if (isYesterday(date)) {
      return 'Yesterday';
    }

    // Older dates
    return format(date, 'MMM d');
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
}

/**
 * Generate username from full name
 */
export function generateUsername(fullName: string): string {
  // Convert to lowercase and remove spaces/special chars
  let username = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  // If empty, use default
  if (!username) {
    username = 'user';
  }

  // Add random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${username}${randomNum}`;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone.startsWith('+')) {
    return false;
  }

  // Count digits only
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * Format phone number as user types
 */
export function formatPhoneNumber(input: string): string {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, '');

  // If doesn't start with +, add it
  let formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

  // Format for US numbers (+1)
  if (formatted.startsWith('+1')) {
    const digits = formatted.slice(2);

    if (digits.length === 0) {
      return '+1 ';
    }

    if (digits.length <= 3) {
      return `+1 (${digits}`;
    }

    if (digits.length <= 6) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  // For other country codes, just add spaces every 3-4 digits
  if (formatted.length > 3) {
    const countryCode = formatted.slice(0, formatted.indexOf(' ') > 0 ? formatted.indexOf(' ') : 3);
    const rest = formatted.slice(countryCode.length).replace(/\s/g, '');
    
    let formattedRest = '';
    for (let i = 0; i < rest.length; i += 3) {
      if (i > 0) formattedRest += ' ';
      formattedRest += rest.slice(i, i + 3);
    }
    
    return `${countryCode} ${formattedRest}`;
  }

  return formatted;
}

/**
 * Get color based on commitment score
 */
export function getCommitmentScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // green
  if (score >= 70) return '#f59e0b'; // orange
  return '#ef4444'; // red
}

/**
 * Get label based on commitment score
 */
export function getCommitmentScoreLabel(score: number): string {
  if (score >= 90) return 'Highly Reliable';
  if (score >= 70) return 'Usually Shows Up';
  if (score >= 50) return 'Sometimes Flakes';
  return 'Often Cancels';
}

/**
 * Generate random short code for sharing links
 */
export function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from full name
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format price
 */
export function formatPrice(amount: number): string {
  if (amount === 0) {
    return 'Free';
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Parse price from string (remove $ and convert to number)
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Check if date is in the past
 */
export function isPast(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return date < new Date();
  } catch (error) {
    return false;
  }
}

/**
 * Check if date is upcoming (within next 7 days)
 */
export function isUpcoming(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= now && date <= sevenDaysFromNow;
  } catch (error) {
    return false;
  }
}

/**
 * Generate random color for avatars
 */
export function getRandomColor(): string {
  const colors = [
    '#ef4444', // red
    '#f59e0b', // orange
    '#10b981', // green
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, ascending: boolean = true): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate attendance rate percentage
 */
export function calculateAttendanceRate(attended: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((attended / total) * 100);
}

/**
 * Get status badge color
 */
export function getStatusColor(status: 'proposed' | 'confirmed' | 'completed'): string {
  switch (status) {
    case 'proposed':
      return '#f59e0b'; // orange
    case 'confirmed':
      return '#10b981'; // green
    case 'completed':
      return '#6b7280'; // gray
    default:
      return '#9ca3af';
  }
}

/**
 * Format duration (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Clean phone number (remove formatting)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Check if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
