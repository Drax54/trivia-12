import type { Metadata } from 'next';
import categoriesData from '@/data/categories.json';
import quizzesData from '@/data/quizzes.json';
import { CategoriesClient } from './client';

// Metadata
export const metadata: Metadata = {
  title: 'Trivia Categories | Trivia Master',
  description: 'Browse our extensive collection of trivia categories and find quizzes on your favorite topics.',
  keywords: 'trivia categories, quiz categories, trivia topics, quiz subjects',
  alternates: {
    canonical: 'http://localhost:3000/categories/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function CategoriesPage() {
  console.log('[PAGE] Rendering categories page');
  const startTime = performance.now();
  
  // Process categories and quizzes
  const { categories } = categoriesData;
  const { quizzes } = quizzesData;
  
  console.log(`[PAGE] Processing ${categories.length} categories and ${quizzes.length} quizzes`);
  
  // Count quizzes per category
  const categoryQuizCounts = categories.map(category => {
    const quizCount = quizzes.filter(quiz => quiz.categoryId === category.id).length;
    return {
      ...category,
      quizCount
    };
  });
  
  console.log(`[PAGE] Processed category quiz counts`);
  
  // Sort categories by most popular (most quizzes)
  const sortedCategories = [...categoryQuizCounts].sort((a, b) => b.quizCount - a.quizCount);
  
  const endTime = performance.now();
  console.log(`[PAGE] Categories page rendering completed in ${Math.round(endTime - startTime)}ms`);
  
  return <CategoriesClient categories={sortedCategories} />;
}