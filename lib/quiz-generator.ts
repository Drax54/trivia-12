import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface GenerateQuizParams {
  category: string;
  questionCount: number;
  difficulty: string;
  topics: string;
  includeExplanations: boolean;
  showAllQuestions?: boolean;
}

export async function generateQuizQuestions(params: GenerateQuizParams): Promise<QuizQuestion[]> {
  console.log("[DEBUG LIB] Generating quiz questions with params:", JSON.stringify({
    category: params.category,
    topics: params.topics,
    questionCount: params.questionCount,
    difficulty: params.difficulty,
    includeExplanations: params.includeExplanations
  }, null, 2));
  
  const prompt = createPrompt(params);
  console.log("[DEBUG LIB] Generated prompt:", prompt);
  
  try {
    console.time("[DEBUG LIB] OpenAI API call time");
    console.log("[DEBUG LIB] Calling OpenAI API with model: gpt-4-turbo-preview");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional quiz creator specializing in creating engaging, accurate, and highly specific trivia questions. 
          Your task is to generate quiz questions based on the user's specifications, with special emphasis on their chosen topic.
          Each question should be relevant to the specified category and topic, with the difficulty level properly calibrated.
          Each question must have one correct answer and three plausible but incorrect options.
          For multiple choice questions, make sure options are distinct and don't overlap in meaning.
          Avoid ambiguous questions or answers, and ensure factual accuracy.
          The response should be in valid JSON format as specified.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    console.timeEnd("[DEBUG LIB] OpenAI API call time");
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.error("[DEBUG LIB] No response content from OpenAI");
      throw new Error('No response from GPT');
    }
    
    console.log("[DEBUG LIB] OpenAI completion token usage:", {
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
    });

    console.time("[DEBUG LIB] JSON parsing time");
    const parsedResponse = JSON.parse(response);
    console.timeEnd("[DEBUG LIB] JSON parsing time");
    
    console.log("[DEBUG LIB] Response questions count:", parsedResponse.questions?.length);
    return parsedResponse.questions;
  } catch (error) {
    console.error('[DEBUG LIB] Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions');
  }
}

function createPrompt(params: GenerateQuizParams): string {
  const difficultyGuide = {
    easy: "straightforward questions with commonly known facts, suitable for beginners",
    medium: "moderately challenging questions requiring good knowledge of the subject",
    hard: "difficult questions that require extensive knowledge and some critical thinking",
    expert: "extremely challenging questions only true experts would likely know"
  };

  return `
    Create ${params.questionCount} high-quality trivia questions specifically about "${params.topics}" within the broader category of ${params.category}.
    
    Important Requirements:
    - Generate exactly ${params.questionCount} questions (no more, no less)
    - The questions MUST focus specifically on ${params.topics} as the primary subject
    - Difficulty level: ${params.difficulty} (${difficultyGuide[params.difficulty as keyof typeof difficultyGuide]})
    - Each question should have exactly 4 options labeled A, B, C, and D
    - Ensure only ONE answer is correct, and all others are clearly incorrect but plausible
    - Questions should be engaging, interesting, and factually accurate
    - Vary the types of questions (e.g., who, what, when, where, how) 
    - Ensure questions are diverse and cover different aspects of the topic
    - For large sets (15-20 questions), ensure good coverage of different subtopics
    - Maintain consistent difficulty across all questions
    ${params.includeExplanations ? '- Include a brief but informative explanation for each correct answer' : ''}
    - Don't create multiple questions that are too similar to each other
    
    The user has specifically requested ${params.questionCount} questions about "${params.topics}" with ${params.difficulty} difficulty, so ensure all questions match this criteria precisely.
    
    The response should be a JSON object with this structure:
    {
      "questions": [
        {
          "question": "The specific question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The exact text of the correct option",
          ${params.includeExplanations ? '"explanation": "Brief explanation of why this answer is correct",' : ''}
        },
        ...
      ]
    }
  `;
} 