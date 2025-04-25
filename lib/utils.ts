import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Quiz } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return dateString; // Return the original string if parsing fails
  }
}

// Get a consistent URL for a quiz
export function getQuizUrl(quiz: Quiz): string {
  // Convert category and subcategory names to URL-friendly format
  const categorySlug = quiz.category?.toLowerCase().replace(/\s+/g, '-') || quiz.categoryId;
  const subcategorySlug = quiz.subcategory?.toLowerCase().replace(/\s+/g, '-') || quiz.subcategoryId;
  return `/${categorySlug}/${subcategorySlug}/${quiz.id}`;
}
