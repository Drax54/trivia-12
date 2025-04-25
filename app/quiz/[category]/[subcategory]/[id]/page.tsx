import QuizClient from './client';
import QuizStats from '@/components/quiz-stats';
import { Quiz } from '@/types';
import { getQuizById } from '@/lib/quiz';
import quizzesData from '@/data/quizzes.json';
import categoriesData from '@/data/categories.json';
import subcategoriesData from '@/data/subcategories.json';

// Static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Generate all possible static paths for quizzes
export async function generateStaticParams() {
  console.log('[BUILD] Generating static params for quiz category/subcategory pages');
  const startTime = performance.now();
  
  const { quizzes } = quizzesData;
  const { categories } = categoriesData;
  const { subcategories } = subcategoriesData;
  
  const paths = [];
  
  for (const quiz of quizzes) {
    // Find the category and subcategory for this quiz
    const categoryId = quiz.categoryId;
    const subcategoryId = quiz.subcategoryId;
    
    if (categoryId && subcategoryId) {
      paths.push({
        category: categoryId,
        subcategory: subcategoryId,
        id: quiz.id
      });
    }
  }
  
  const endTime = performance.now();
  console.log(`[BUILD] Generated ${paths.length} static quiz paths in ${Math.round(endTime - startTime)}ms`);
  return paths;
}

// Update params to include category and subcategory
interface QuizPageParams {
  params: Promise<{ 
    category: string;
    subcategory: string;
    id: string;
  }>
}

export default async function QuizPage({ params }: QuizPageParams) {
  // Await the params
  const resolvedParams = await params;
  console.log(`[PAGE] Rendering quiz page for: ${resolvedParams.category}/${resolvedParams.subcategory}/${resolvedParams.id}`);
  const startTime = performance.now();
  
  const quiz = await getQuizById(resolvedParams.id);

  if (!quiz) {
    console.error(`[PAGE] Quiz not found: ${resolvedParams.id}`);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz not found</h1>
          <p className="mt-2 text-gray-600">The quiz you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }
  
  const endTime = performance.now();
  console.log(`[PAGE] Quiz page rendering completed in ${Math.round(endTime - startTime)}ms`);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* @ts-expect-error Server Component */}
      <QuizClient quiz={quiz} />
      
      {/* Add quiz statistics below the quiz */}
      <div className="mt-8">
        <QuizStats quizId={resolvedParams.id} />
      </div>
    </div>
  );
} 