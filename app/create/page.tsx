import type { Metadata } from 'next';
import { CreateQuizClient } from './client';

const categories = [
  { id: 'movies', name: 'Movies & TV Shows', icon: '🎬' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'history', name: 'History', icon: '📚' },
  { id: 'geography', name: 'Geography', icon: '🌍' },
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'hard', label: 'Hard', color: 'bg-red-500' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-500' },
];

const storeQuizAndNavigate = (quizData: any, quizId: string) => {
  return new Promise<void>((resolve) => {
    // Store in primary location
    localStorage.setItem('generatedQuiz', JSON.stringify(quizData));
    console.log("[DEBUG] Quiz stored in generatedQuiz");
    
    // Also store with the specific ID
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizData));
    console.log("[DEBUG] Quiz stored in quiz_" + quizId);
    
    // Additional storage as backup
    sessionStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizData));
    console.log("[DEBUG] Quiz also stored in sessionStorage");
    
    // Verify data is actually stored
    const verifyFromStorage = localStorage.getItem(`quiz_${quizId}`);
    if (verifyFromStorage) {
      console.log("[DEBUG] Verified quiz is in localStorage");
    } else {
      console.error("[DEBUG] Failed to verify quiz in localStorage");
    }
    
    // Small delay to ensure browser storage is updated
    setTimeout(() => {
      resolve();
    }, 300);
  });
};

// Metadata
export const metadata: Metadata = {
  title: 'Create Quiz | Trivia Master',
  description: 'Create your own custom trivia quiz with our AI-powered quiz generator. Choose from various categories and difficulty levels.',
  keywords: 'create quiz, custom quiz, AI quiz generator, trivia maker, quiz builder',
  alternates: {
    canonical: 'http://localhost:3000/create/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Static page generation
export const dynamic = 'force-static';

export default function CreateQuizPage() {
  console.log('[PAGE] Rendering create quiz page');
  const startTime = performance.now();
  
  // This page allows users to create custom quizzes
  // The actual quiz generation happens in the client component
  
  const endTime = performance.now();
  console.log(`[PAGE] Create quiz page rendering completed in ${Math.round(endTime - startTime)}ms`);
  
  return <CreateQuizClient />;
} 