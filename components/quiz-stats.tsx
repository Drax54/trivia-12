"use client";

import { useEffect, useState } from 'react';

interface QuizStats {
  totalAttempts: number;
  uniqueUsers: number;
  averageScore: number;
  highestScore: number;
  recentScores: {
    score: number;
    totalQuestions: number;
    timestamp: string;
  }[];
}

export default function QuizStats({ quizId }: { quizId: string }) {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch stats from localStorage instead of API
    try {
      console.log('Fetching quiz stats from localStorage for quiz ID:', quizId);
      
      // Get quiz stats from localStorage
      const quizStats = JSON.parse(localStorage.getItem(`quiz_stats_${quizId}`) || JSON.stringify({
        attempts: 0,
        lastAttempt: null,
        scores: []
      }));
      
      // Format stats for display
      const formattedStats: QuizStats = {
        totalAttempts: quizStats.attempts || 0,
        uniqueUsers: 1, // Only one user in localStorage
        averageScore: 0,
        highestScore: 0,
        recentScores: quizStats.scores || []
      };

      // Calculate average and highest scores
      if (quizStats.scores && quizStats.scores.length > 0) {
        let totalScorePercent = 0;
        
        quizStats.scores.forEach((score: any) => {
          const scorePercent = (score.score / score.totalQuestions) * 100;
          totalScorePercent += scorePercent;
          formattedStats.highestScore = Math.max(formattedStats.highestScore, scorePercent);
        });
        
        formattedStats.averageScore = totalScorePercent / quizStats.scores.length;
        
        // Sort recent scores by timestamp
        formattedStats.recentScores.sort((a: any, b: any) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        // Limit to 5 most recent
        formattedStats.recentScores = formattedStats.recentScores.slice(0, 5);
      }
      
      setStats(formattedStats);
      setLoading(false);
    } catch (err) {
      console.error('Error getting quiz stats from localStorage:', err);
      setError('Failed to load statistics');
      setLoading(false);
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!stats || stats.totalAttempts === 0) {
    return (
      <div className="text-gray-500 p-4">
        No statistics available for this quiz yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Quiz Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Attempts</div>
          <div className="text-2xl font-bold text-primary">{stats.totalAttempts}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Your Attempts</div>
          <div className="text-2xl font-bold text-primary">{stats.uniqueUsers}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Average Score</div>
          <div className="text-2xl font-bold text-primary">{stats.averageScore.toFixed(1)}%</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Highest Score</div>
          <div className="text-2xl font-bold text-primary">{stats.highestScore.toFixed(1)}%</div>
        </div>
      </div>

      {stats.recentScores.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Scores</h4>
          <div className="space-y-2">
            {stats.recentScores.map((score, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">
                  {new Date(score.timestamp).toLocaleDateString()} at{' '}
                  {new Date(score.timestamp).toLocaleTimeString()}
                </div>
                <div className="font-medium text-primary">
                  {((score.score / score.totalQuestions) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 