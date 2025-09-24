/**
 * Format a number to display with exactly 2 decimal places
 */
export const formatDecimal = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(2);
};

/**
 * Format a percentage with 2 decimal places and % symbol
 */
export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
};

/**
 * Format currency with 2 decimal places
 */
export const formatCurrency = (value: number | undefined | null, currency: string = '₱'): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return `${currency}0.00`;
  }
  return `${currency}${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format rating with 2 decimal places
 */
export const formatRating = (value: any): string => {
  // Handle various input types
  if (value === undefined || value === null) {
    return '0.00';
  }
  
  // If it's an object (like Decimal from database), try to get its value
  if (typeof value === 'object' && value.toString) {
    value = value.toString();
  }
  
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(numValue)) {
    console.warn('formatRating received non-numeric value:', value);
    return '0.00';
  }
  
  return numValue.toFixed(2);
};

/**
 * Format date to a readable string
 */
export const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) {
    return 'N/A';
  }
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes === 0) {
        return 'Just now';
      }
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) === 1 ? '' : 's'} ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) === 1 ? '' : 's'} ago`;
  
  // For dates older than a year, show the actual date
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Course thumbnail images by category
const courseThumbnails = {
  'Web Development': [
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format'
  ],
  'Programming': [
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop&auto=format'
  ],
  'Data Science': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format'
  ],
  'Computer Vision': [
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=250&fit=crop&auto=format'
  ],
  'Mobile Development': [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1605170439002-90845e8c0137?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400&h=250&fit=crop&auto=format'
  ],
  'Marketing': [
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&h=250&fit=crop&auto=format'
  ],
  'default': [
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format'
  ]
};

export const getCourseThumbnail = (category: string, courseId: number | string): string => {
  const categoryImages = courseThumbnails[category as keyof typeof courseThumbnails] || courseThumbnails.default;
  // Use course ID to consistently select the same image for each course
  const index = typeof courseId === 'number' ? courseId : parseInt(courseId.toString(), 10);
  return categoryImages[index % categoryImages.length];
};