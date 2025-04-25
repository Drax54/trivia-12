"use client";

import { useEffect, useState } from 'react';
import { Quiz } from '@/types';

export default function QuizClient({ quiz }: { quiz: Quiz }) {
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  
  // Use localStorage to track quiz attempts instead of server API
  useEffect(() => {
    // Track quiz start
    try {
      console.log('Quiz component mounted, tracking start for quiz ID:', quiz.id);
      
      // Get quiz stats from localStorage
      const quizStats = JSON.parse(localStorage.getItem(`quiz_stats_${quiz.id}`) || JSON.stringify({
        attempts: 0,
        lastAttempt: null,
        scores: []
      }));
      
      // Increment attempts
      quizStats.attempts += 1;
      quizStats.lastAttempt = new Date().toISOString();
      
      // Save updated stats
      localStorage.setItem(`quiz_stats_${quiz.id}`, JSON.stringify(quizStats));
      console.log('Updated quiz stats in localStorage:', quizStats);
    } catch (err) {
      console.error('Failed to track quiz start:', err);
    }
  }, [quiz.id]);
  
  const handleQuizComplete = async (score: number) => {
    setShowResults(true);
    setFinalScore(score);
    
    console.log(`Quiz completed with score ${score}/${quiz.questions.length}`);
    
    // Track quiz completion in localStorage
    try {
      // Get quiz stats from localStorage
      const quizStats = JSON.parse(localStorage.getItem(`quiz_stats_${quiz.id}`) || JSON.stringify({
        attempts: 0,
        lastAttempt: null,
        scores: []
      }));
      
      // Record score
      quizStats.scores.push({
        score,
        totalQuestions: quiz.questions.length,
        timestamp: new Date().toISOString()
      });
      
      // Save updated stats
      localStorage.setItem(`quiz_stats_${quiz.id}`, JSON.stringify(quizStats));
      console.log('Updated quiz stats with score in localStorage:', quizStats);
      
      // Update completed quizzes
      const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
      if (!completedQuizzes.includes(quiz.id)) {
        completedQuizzes.push(quiz.id);
        localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
      }
    } catch (err) {
      console.error('Failed to track quiz completion:', err);
    }
  };

  // ... rest of the existing component code ...
} 