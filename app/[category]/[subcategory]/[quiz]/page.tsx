import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import QuizClient from './client';
import categoriesData from '@/data/categories.json';
import subcategoriesData from '@/data/subcategories.json';
import quizzesData from '@/data/quizzes.json';
import questionsData from '@/data/questions.json';
import studyTopicsData from '@/data/study-topics.json';
import studyMainTopicsData from '@/data/study-main-topics.json';
import studySubcategoriesData from '@/data/study-subcategories.json';
import contentQuizData from '@/data/content-quiz.json';
import { Quiz } from '@/types';

// Add types for study-related data
interface StudyMainTopic {
  id: string;
  name: string;
  description: string;
  metaDescription: string;
  icon: string;
  image: string;
  totalStudyMaterials: number;
  relatedQuizzes: number;
  popularTags: string[];
  featured: boolean;
}

interface StudySubcategory {
  id: string;
  mainTopicId: string;
  name: string;
  description: string;
  metaDescription: string;
  image: string;
  totalStudyMaterials: number;
  popularTags: string[];
}

// Define a more flexible StudyTopic type to match the data structure
interface StudyTopic {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  description: string;
  metaDescription: string;
  image: string;
  content: any; // Using any for flexibility since content can be string or object
  difficulty: string;
  readingTime: number;
  relatedQuizIds: string[];
  relatedTopicIds: string[];
  tags: string[];
  lastUpdated: string;
  [key: string]: any; // Allow for additional properties
}

interface QuizParams {
  params: Promise<{
    category: string;
    subcategory: string;
    quiz: string;
  }>;
}

// Generate static params for all quiz pages
export async function generateStaticParams() {
  const { quizzes } = quizzesData;
  const params = quizzes.map((quiz) => ({
    category: quiz.categoryId,
    subcategory: quiz.subcategoryId,
    quiz: quiz.id,
  }));
  return params;
}

// Helper function to extract the parameters properly
async function getQuizParams(params: QuizParams['params']) {
  const resolvedParams = await params;
  return {
    category: resolvedParams.category,
    subcategory: resolvedParams.subcategory,
    quiz: resolvedParams.quiz
  };
}

// Generate metadata for each quiz page
export async function generateMetadata({ params }: QuizParams): Promise<Metadata> {
  // Await the params to satisfy Next.js requirements
  const { category: categoryId, subcategory: subcategoryId, quiz: quizId } = await getQuizParams(params);

  const { categories } = categoriesData;
  const { subcategories } = subcategoriesData;
  const { quizzes } = quizzesData;
  const { quizzes: quizzesWithQuestions } = questionsData;
  
  const category = categories.find((c) => c.id === categoryId);
  const subcategory = subcategories.find((s) => s.id === subcategoryId);
  const quiz = quizzes.find((q) => q.id === quizId);
  const quizWithQuestions = quizzesWithQuestions.find((q) => q.id === quizId);

  if (!quiz || !category || !subcategory) {
    return {
      title: 'Quiz Not Found',
    };
  }

  const description = quiz.description || 
    `Test your knowledge with this ${quiz.difficulty} difficulty quiz about ${category.name} - ${subcategory.name}. ${quiz.questionCount} questions to challenge your expertise!`;

  // Use the title from questions.json instead of quiz.name
  const enhancedTitle = quizWithQuestions && quizWithQuestions.title 
    ? `${quizWithQuestions.title} | Trivia Master`
    : `${quiz.name} | Trivia Master`;
  
  // Base URL for canonical links - will be replaced with production domain later
  const baseUrl = 'http://localhost:3000';
  const canonicalUrl = `${baseUrl}/${categoryId}/${subcategoryId}/${quizId}/`;

  return {
    title: enhancedTitle,
    description: description,
    keywords: quiz.tags?.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: enhancedTitle,
      description: description,
      type: 'website',
      url: canonicalUrl,
      images: [
        {
          url: 'https://triviamaster.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: quizWithQuestions && quizWithQuestions.title 
            ? `${quizWithQuestions.title} on Trivia Master`
            : `${quiz.name} Quiz on Trivia Master`
        }
      ],
      siteName: 'Trivia Master',
    },
    twitter: {
      card: 'summary_large_image',
      title: enhancedTitle,
      description: description,
      images: ['https://triviamaster.com/twitter-image.jpg'],
      creator: '@triviamaster'
    },
    metadataBase: new URL('https://triviamaster.com'),
  };
}

export default async function QuizPage({ params }: QuizParams) {
  // Await the params to satisfy Next.js requirements
  const { category: categoryId, subcategory: subcategoryId, quiz: quizId } = await getQuizParams(params);

  const { categories } = categoriesData;
  const { subcategories } = subcategoriesData;
  const { quizzes } = quizzesData;
  const { quizzes: quizzesWithQuestions } = questionsData;
  const { topics: studyTopics } = studyTopicsData;
  const { mainTopics: studyMainTopics } = studyMainTopicsData;
  const { subcategories: studySubcategories } = studySubcategoriesData;
  const { contents: quizContents } = contentQuizData;

  // Debug logs for server
  console.log("Quiz params:", { categoryId, subcategoryId, quizId });
  console.log("Available quizzes IDs:", quizzes.map(q => q.id));
  console.log("Available questions quiz IDs:", quizzesWithQuestions.map(q => q.id));

  const category = categories.find((c) => c.id === categoryId);
  const subcategory = subcategories.find(
    (s) => s.id === subcategoryId && s.categoryId === categoryId
  );
  const quiz = quizzes.find(
    (q) => q.id === quizId && 
    q.categoryId === categoryId && 
    q.subcategoryId === subcategoryId
  );
  
  // Find the matching quiz data in questions.json
  const quizWithQuestions = quizzesWithQuestions.find(q => q.id === quizId);
  const questions = quizWithQuestions?.questions || [];
  
  // More debug logging
  console.log("Found quiz:", quiz?.id, quiz?.name);
  console.log("Found quiz with questions:", quizWithQuestions?.id, quizWithQuestions?.title);
  console.log("Questions count:", questions.length);

  // Find related study topic if it exists
  let relatedStudyTopic: StudyTopic | null = null;
  let studyMainTopic: StudyMainTopic | null = null;
  let studySubcategory: StudySubcategory | null = null;
  
  if (quiz?.studyTopicId) {
    relatedStudyTopic = studyTopics.find(t => t.id === quiz.studyTopicId) || null;
    
    if (relatedStudyTopic) {
      studyMainTopic = studyMainTopics.find(mt => mt.id === relatedStudyTopic?.categoryId) || null;
      studySubcategory = studySubcategories.find(sc => 
        sc.id === relatedStudyTopic?.subcategoryId && 
        sc.mainTopicId === relatedStudyTopic?.categoryId
      ) || null;
    }
  }

  // Find the quiz content
  const quizContent = quizContents.find(content => 
    content.quizId === quizId && 
    content.categoryId === categoryId && 
    content.subcategoryId === subcategoryId
  );

  if (!category || !subcategory || !quiz || !questions.length) {
    notFound();
  }

  // Transform the quiz object to match the Quiz type
  const transformedQuiz: Quiz = {
    id: quiz.id,
    title: quiz.name,
    categoryId: category.id,
    subcategoryId: subcategory.id,
    description: quiz.description,
    difficulty: quiz.difficulty,
    timeLimit: quiz.timeLimit,
    includeExplanations: true,
    questionCount: quiz.questionCount,
    popularity: quiz.popularity,
    attempts: quiz.attempts,
    tags: quiz.tags,
    questions: questions.map(q => ({
      ...q,
      difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard'
    })),
    studyTopicId: quiz.studyTopicId,
    lastUpdated: new Date().toISOString(),
    image: quiz.image,
    quizContent: quizContent?.content
  };

  return (
    <QuizClient 
      category={category}
      subcategory={subcategory}
      quiz={transformedQuiz}
      questions={questions}
      quizTitle={quizWithQuestions?.title}
      relatedStudyTopic={relatedStudyTopic}
      studyMainTopic={studyMainTopic}
      studySubcategory={studySubcategory}
    />
  );
}