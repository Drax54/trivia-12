import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryClient from './client';
import categoriesData from '@/data/categories.json';
import subcategoriesData from '@/data/subcategories.json';
import quizzesData from '@/data/quizzes.json';
import questionsData from '@/data/questions.json';
import { Quiz } from '@/types';

interface CategoryParams {
  params: Promise<{
    category: string;
  }>;
}

// Generate static params for all category routes
export async function generateStaticParams() {
  const { categories } = categoriesData;
  return categories.map((category) => ({
    category: category.id,
  }));
}

// Helper function to extract the category parameter properly
async function getCategoryParam(params: CategoryParams['params']) {
  const resolvedParams = await params;
  return resolvedParams.category;
}

// Generate metadata for each category page
export async function generateMetadata({ params }: CategoryParams): Promise<Metadata> {
  const { categories } = categoriesData;
  const categoryId = await getCategoryParam(params);
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  // Base URL for canonical links - will be replaced with production domain later
  const baseUrl = 'http://localhost:3000';
  const canonicalUrl = `${baseUrl}/${categoryId}/`;

  const title = `${category.name} Related Trivia Questions and Answers | Trivia Master`;
  const description = category.metaDescription || `Explore our collection of ${category.name.toLowerCase()} quizzes. Test your knowledge with thousands of questions across various ${category.name.toLowerCase()} topics.`;

  return {
    title: title,
    description: description,
    keywords: `${category.name.toLowerCase()} quizzes, ${category.name.toLowerCase()} trivia, online ${category.name.toLowerCase()} test, ${category.popularTags?.join(', ')}`,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: canonicalUrl,
      images: [
        {
          url: 'https://triviamaster.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${category.name} Quizzes on Trivia Master`
        }
      ],
      siteName: 'Trivia Master',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['https://triviamaster.com/twitter-image.jpg'],
      creator: '@triviamaster'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    metadataBase: new URL('https://triviamaster.com'),
  };
}

// Static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default async function CategoryPage({ params }: CategoryParams) {
  const { categories } = categoriesData;
  const { subcategories } = subcategoriesData;
  const { quizzes } = quizzesData;
  const { quizzes: quizzesWithQuestions } = questionsData;

  const categoryId = await getCategoryParam(params);
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    notFound();
  }

  const categorySubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === categoryId
  );

  const categoryQuizzes = quizzes.filter(
    (quiz) => quiz.categoryId === categoryId
  );

  // Transform quizzes to match the Quiz type
  const transformedQuizzes: Quiz[] = categoryQuizzes.map(quiz => {
    // Find the subcategory for this quiz
    const subcategory = subcategories.find(sub => sub.id === quiz.subcategoryId);
    
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
      subcategory: subcategory?.name || ''
    };
  });

  return (
    <CategoryClient 
      category={category}
      subcategories={categorySubcategories}
      quizzes={transformedQuizzes}
      quizzesWithQuestions={quizzesWithQuestions}
    />
  );
}