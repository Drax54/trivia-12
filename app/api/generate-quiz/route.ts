import { NextResponse } from 'next/server';
import { generateQuizQuestions, GenerateQuizParams } from '@/lib/quiz-generator';

// For static exports we need to use edge runtime
export const runtime = 'edge';

// Simple in-memory cache for IP-based limiting
// This will reset when the server restarts
// In production, this should use a persistent store like Redis
const ipLimitCache = new Map<string, { count: number, resetTime: number }>();

// Clean expired IP entries every hour
const CLEAN_INTERVAL = 60 * 60 * 1000; // 1 hour
setInterval(() => {
  const now = Date.now();
  // Use Array.from to convert to array for compatibility
  Array.from(ipLimitCache.keys()).forEach(ip => {
    const data = ipLimitCache.get(ip);
    if (data && data.resetTime < now) {
      ipLimitCache.delete(ip);
    }
  });
}, CLEAN_INTERVAL);

// Check if IP has reached generation limit
const hasReachedIPLimit = (ip: string): boolean => {
  if (!ip) return false;
  
  const now = Date.now();
  const limitData = ipLimitCache.get(ip);
  
  if (!limitData) {
    // First time, initialize
    const resetTime = getMidnightTomorrow();
    ipLimitCache.set(ip, { count: 1, resetTime });
    return false;
  }
  
  // Check if reset time passed
  if (limitData.resetTime < now) {
    // Reset count
    const resetTime = getMidnightTomorrow();
    ipLimitCache.set(ip, { count: 1, resetTime });
    return false;
  }
  
  // If 20 or more (server limit is higher as fallback for multiple devices)
  if (limitData.count >= 20) {
    return true;
  }
  
  // Increment count
  ipLimitCache.set(ip, { 
    count: limitData.count + 1, 
    resetTime: limitData.resetTime 
  });
  
  return false;
};

// Get midnight tomorrow timestamp
const getMidnightTomorrow = (): number => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

export async function POST(request: Request) {
  console.log("[DEBUG API] Received generate-quiz request");
  console.time("[DEBUG API] Total processing time");
  
  try {
    // Get client IP for rate limiting
    // For Edge runtime, X-Forwarded-For is typically available
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    console.log(`[DEBUG API] Request from IP: ${ip}`);
    
    // Server-side IP-based limiting (higher limit than client-side)
    if (hasReachedIPLimit(ip)) {
      console.log(`[DEBUG API] IP ${ip} has reached generation limit`);
      return NextResponse.json(
        { error: 'Daily quiz generation limit reached. Please try again tomorrow.' },
        { status: 429 }
      );
    }
    
    const params: GenerateQuizParams = await request.json();
    console.log("[DEBUG API] Request params:", JSON.stringify(params, null, 2));

    // Validate required fields
    if (!params.category || !params.questionCount || !params.difficulty || !params.topics) {
      console.error("[DEBUG API] Missing required fields:", { 
        hasCategory: !!params.category, 
        hasQuestionCount: !!params.questionCount, 
        hasDifficulty: !!params.difficulty, 
        hasTopics: !!params.topics 
      });
      
      return NextResponse.json(
        { error: 'Missing required fields: category, questionCount, difficulty, and topics are all required' },
        { status: 400 }
      );
    }

    console.time("[DEBUG API] Quiz generation time");
    const questions = await generateQuizQuestions(params);
    console.timeEnd("[DEBUG API] Quiz generation time");
    console.log("[DEBUG API] Generated", questions.length, "questions");

    console.timeEnd("[DEBUG API] Total processing time");
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('[DEBUG API] Error in generate-quiz route:', error);
    console.timeEnd("[DEBUG API] Total processing time");
    
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
} 