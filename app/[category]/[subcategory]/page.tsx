import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SubcategoryClient from './client';
import categoriesData from '@/data/categories.json';
import subcategoriesData from '@/data/subcategories.json';
import quizzesData from '@/data/quizzes.json';
import questionsData from '@/data/questions.json';
import { Quiz } from '@/types';

interface SubcategoryParams {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

// Generate static params for all subcategory pages
export async function generateStaticParams() {
  console.log('[BUILD] Generating static params for subcategory pages');
  const { subcategories } = subcategoriesData;
  const params = subcategories.map((subcategory) => ({
    category: subcategory.categoryId,
    subcategory: subcategory.id,
  }));
  console.log(`[BUILD] Generated ${params.length} static subcategory paths`);
  return params;
}

// Helper function to extract the parameters properly
async function getParams(params: SubcategoryParams['params']) {
  const resolvedParams = await params;
  return {
    category: resolvedParams.category,
    subcategory: resolvedParams.subcategory
  };
}

// Generate metadata for each subcategory page
export async function generateMetadata({ params }: SubcategoryParams): Promise<Metadata> {
  const resolvedParams = await params;
  console.log(`[BUILD] Generating metadata for subcategory: ${resolvedParams.category}/${resolvedParams.subcategory}`);
  const { subcategories } = subcategoriesData;
  const { category, subcategory: subcategoryId } = await getParams(params);
  const subcategory = subcategories.find((s) => s.id === subcategoryId);

  if (!subcategory) {
    console.warn(`[BUILD] Subcategory not found: ${subcategoryId}`);
    return {
      title: 'Subcategory Not Found',
    };
  }

  // Base URL for canonical links - will be replaced with production domain later
  const baseUrl = 'http://localhost:3000';
  const canonicalUrl = `${baseUrl}/${category}/${subcategoryId}/`;

  return {
    title: `${subcategory.name} Quizzes | Trivia Master`,
    description: subcategory.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${subcategory.name} Quizzes | Trivia Master`,
      description: subcategory.description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Trivia Master',
    },
  };
}

// Static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default async function SubcategoryPage({ params }: SubcategoryParams) {
  const resolvedParams = await params;
  console.log(`[PAGE] Rendering subcategory page: ${resolvedParams.category}/${resolvedParams.subcategory}`);
  
  const startTime = performance.now();
  const { categories } = categoriesData;
  const { subcategories } = subcategoriesData;
  const { quizzes } = quizzesData;
  const { quizzes: quizzesWithQuestions } = questionsData;

  const { category: categoryId, subcategory: subcategoryId } = await getParams(params);
  
  const category = categories.find((c) => c.id === categoryId);
  const subcategory = subcategories.find(
    (s) => s.id === subcategoryId && s.categoryId === categoryId
  );

  if (!category || !subcategory) {
    console.error(`[PAGE] Not found: category=${categoryId}, subcategory=${subcategoryId}`);
    notFound();
  }

  const subcategoryQuizzes = quizzes.filter(
    (quiz) => quiz.subcategoryId === subcategoryId
  );
  console.log(`[PAGE] Found ${subcategoryQuizzes.length} quizzes for subcategory: ${subcategory.name}`);

  // Transform quizzes to match Quiz type
  const transformedQuizzes: Quiz[] = subcategoryQuizzes.map(quiz => {
    // Find matching questions for this quiz
    const quizWithQuestions = quizzesWithQuestions.find(q => q.id === quiz.id);
    const questions = quizWithQuestions?.questions || [];
    
    return {
      id: quiz.id,
      categoryId: quiz.categoryId,
      subcategoryId: quiz.subcategoryId,
      title: quiz.name,
      description: quiz.description,
      image: quiz.image,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      includeExplanations: true, // Default to true since we have explanations in questions
      quizContent: '', // Default empty string for quiz content
      questionCount: quiz.questionCount,
      popularity: quiz.popularity,
      attempts: quiz.attempts,
      tags: quiz.tags,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard'
      })),
      studyTopicId: quiz.studyTopicId,
      lastUpdated: new Date().toISOString(), // Default to current timestamp
      
      // Add these properties for backward compatibility  
      category: category.name,
      subcategory: subcategory.name
    };
  });

  const endTime = performance.now();
  console.log(`[PAGE] Subcategory page rendering completed in ${Math.round(endTime - startTime)}ms`);

  return (
    <SubcategoryClient 
      category={category}
      subcategory={subcategory}
      quizzes={transformedQuizzes}
      quizzesWithQuestions={quizzesWithQuestions}
    />
  );
}