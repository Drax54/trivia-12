import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Interface for quiz attempt data
interface QuizAttempt {
  ip: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
}

interface QuizTrackingData {
  attempts: {
    [quizId: string]: {
      [ip: string]: {
        totalAttempts: number;
        lastAttempt: string;
        scores: QuizAttempt[];
      };
    };
  };
}

const TRACKING_FILE = path.join(process.cwd(), 'data', 'quiz-tracking.json');

// Initialize tracking file if it doesn't exist
function initializeTrackingFile() {
  console.log(`Checking if tracking file exists: ${TRACKING_FILE}`);
  try {
    if (!fs.existsSync(TRACKING_FILE)) {
      console.log('Creating new tracking file');
      fs.writeFileSync(TRACKING_FILE, JSON.stringify({ attempts: {} }, null, 2));
    } else {
      console.log('Tracking file already exists');
    }
  } catch (error) {
    console.error('Error initializing tracking file:', error);
    throw error;
  }
}

// Get tracking data
function getTrackingData(): QuizTrackingData {
  try {
    initializeTrackingFile();
    console.log('Reading tracking data from file');
    const data = fs.readFileSync(TRACKING_FILE, 'utf-8');
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing tracking data:', error);
      console.log('Raw data:', data);
      // Return empty data structure if parsing fails
      return { attempts: {} };
    }
  } catch (error) {
    console.error('Error getting tracking data:', error);
    return { attempts: {} };
  }
}

// Save tracking data
function saveTrackingData(data: QuizTrackingData) {
  console.log('Saving tracking data to file');
  try {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
    console.log('Tracking data saved successfully');
  } catch (error) {
    console.error('Error saving tracking data:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/quiz-tracking');
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { quizId, action, score, totalQuestions } = body;
    
    if (!quizId) {
      console.error('Missing quizId in request body');
      return NextResponse.json({ 
        success: false, 
        error: 'quizId is required' 
      }, { status: 400 });
    }

    if (!action) {
      console.error('Missing action in request body');
      return NextResponse.json({ 
        success: false, 
        error: 'action is required' 
      }, { status: 400 });
    }
    
    // Get IP address from request
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '127.0.0.1';
    console.log(`IP address: ${ip}`);

    const data = getTrackingData();
    console.log('Current tracking data:', JSON.stringify(data));

    // Initialize quiz data if it doesn't exist
    if (!data.attempts[quizId]) {
      console.log(`Initializing data for quiz ID: ${quizId}`);
      data.attempts[quizId] = {};
    }
    
    // Initialize IP data if it doesn't exist
    if (!data.attempts[quizId][ip]) {
      console.log(`Initializing data for IP: ${ip}`);
      data.attempts[quizId][ip] = {
        totalAttempts: 0,
        lastAttempt: new Date().toISOString(),
        scores: []
      };
    }

    const ipData = data.attempts[quizId][ip];
    console.log(`Current IP data:`, ipData);

    if (action === 'start') {
      // Increment attempts counter when starting quiz
      ipData.totalAttempts++;
      ipData.lastAttempt = new Date().toISOString();
      console.log(`Incremented attempts to ${ipData.totalAttempts}`);
    } else if (action === 'complete') {
      // Record score when completing quiz
      const scoreEntry = {
        ip,
        quizId,
        score: score || 0,
        totalQuestions: totalQuestions || 0,
        timestamp: new Date().toISOString()
      };
      console.log(`Recording score:`, scoreEntry);
      ipData.scores.push(scoreEntry);
    } else {
      console.error(`Unknown action: ${action}`);
      return NextResponse.json({ 
        success: false, 
        error: `Unknown action: ${action}` 
      }, { status: 400 });
    }

    saveTrackingData(data);
    
    console.log('Sending response with updated data');
    return NextResponse.json({ 
      success: true,
      attempts: ipData.totalAttempts,
      lastAttempt: ipData.lastAttempt
    });

  } catch (error) {
    console.error('Error tracking quiz:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
}

// GET endpoint to retrieve stats for a quiz
export async function GET(req: NextRequest) {
  console.log('Received GET request to /api/quiz-tracking');
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');
    console.log(`Requested stats for quiz ID: ${quizId}`);

    if (!quizId) {
      console.log('No quiz ID provided');
      return NextResponse.json({ 
        success: false, 
        error: 'Quiz ID is required' 
      }, { status: 400 });
    }

    const data = getTrackingData();
    const quizData = data.attempts[quizId] || {};
    console.log(`Retrieved data for quiz ID ${quizId}:`, quizData);

    // Calculate aggregate stats
    const stats = {
      totalAttempts: 0,
      uniqueUsers: Object.keys(quizData).length,
      averageScore: 0,
      highestScore: 0,
      recentScores: [] as QuizAttempt[]
    };

    let totalScores = 0;
    let scoreCount = 0;

    Object.values(quizData).forEach(ipData => {
      stats.totalAttempts += ipData.totalAttempts;
      
      ipData.scores.forEach(score => {
        totalScores += (score.score / score.totalQuestions) * 100;
        scoreCount++;
        stats.highestScore = Math.max(stats.highestScore, 
          (score.score / score.totalQuestions) * 100);
      });

      // Get 5 most recent scores
      stats.recentScores.push(...ipData.scores);
    });

    stats.averageScore = scoreCount > 0 ? totalScores / scoreCount : 0;
    stats.recentScores.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    stats.recentScores = stats.recentScores.slice(0, 5);

    console.log('Calculated stats:', stats);
    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('Error retrieving quiz stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
} 