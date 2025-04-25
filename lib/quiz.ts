import path from 'path';
import fs from 'fs';
import { Quiz } from '@/types';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions.json');

interface QuestionsData {
  quizzes: Quiz[];
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    // Read and parse the questions file
    const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
    const questionsData: QuestionsData = JSON.parse(data);
    
    // Find the quiz with matching ID
    const quiz = questionsData.quizzes.find(q => q.id === id);
    return quiz || null;
  } catch (error) {
    console.error('Error reading quiz data:', error);
    return null;
  }
} 