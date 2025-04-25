import type { Metadata } from 'next';
import quizzesData from '@/data/quizzes.json';
import GeneratedQuizClient from './client';

interface StoredQuiz {
  category: string;
  questionCount: number;
  difficulty: string;
  timeLimit: number;
  questions: any[];
  allowRevealAnswer: boolean;
  revealLimit: number;
  includeExplanations: boolean;
  title: string;
  description: string;
}

interface GeneratedQuizParams {
  params: Promise<{ id: string }>;
}

// Server Component
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ 
  params 
}: GeneratedQuizParams): Promise<Metadata> {
  // Await the params
  const resolvedParams = await params;
  console.log(`[BUILD] Generating metadata for quiz ID: ${resolvedParams.id}`);
  
  // Try to find the quiz in our prebuilt data
  const { quizzes } = quizzesData;
  const quiz = quizzes.find((q) => q.id === resolvedParams.id);
  
  if (!quiz) {
    console.warn(`[BUILD] Quiz not found in static data: ${resolvedParams.id}`);
    return {
      title: 'Quiz',
      description: 'Take a trivia quiz!'
    };
  }
  
  console.log(`[BUILD] Created metadata for quiz: ${quiz.name}`);
  return {
    title: `${quiz.name} | Trivia Master Quiz`,
    description: quiz.description,
    keywords: quiz.tags.join(', '),
    alternates: {
      canonical: `http://localhost:3000/quiz/generated/${resolvedParams.id}/`
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate all possible static paths
export async function generateStaticParams() {
  console.log('[BUILD] Generating static params for quiz pages');
  const startTime = performance.now();
  
  const { quizzes } = quizzesData;
  const paths = quizzes.map((quiz) => ({
    id: quiz.id,
  }));
  
  const endTime = performance.now();
  console.log(`[BUILD] Generated ${paths.length} static quiz paths in ${Math.round(endTime - startTime)}ms`);
  return paths;
}

export default async function GeneratedQuizPage({ params }: GeneratedQuizParams) {
  // Await the params
  const resolvedParams = await params;
  
  return (
    <>
      <div id="quiz-loading-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/80 via-white/80 to-blue-50/80 backdrop-blur-sm transition-all duration-300">
        <div className="text-center px-4 max-w-sm mx-auto bg-white/50 p-6 rounded-2xl backdrop-blur">
          <div className="relative mb-3 mx-auto w-14 h-14">
            <div className="w-14 h-14 rounded-full border-2 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
          </div>
          <h2 className="text-lg font-bold mb-1">Loading Quiz</h2>
          <p className="text-gray-600 text-sm">Please wait...</p>
        </div>
      </div>
      <GeneratedQuizClient params={resolvedParams} />
    </>
  );
} 