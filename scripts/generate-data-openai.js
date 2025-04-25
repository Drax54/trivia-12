/**
 * Data Generator Script for Trivia App using OpenAI API
 * 
 * This script generates JSON data for subcategories, quizzes, and questions
 * using the OpenAI API. It creates high-quality data that follows the same 
 * structure as the existing JSON files.
 * 
 * Usage: node generate-data-openai.js
 * 
 * Prerequisites:
 * - Node.js installed
 * - OpenAI API key set as an environment variable OPENAI_API_KEY
 * - Required npm packages installed: openai, dotenv, fs, path, readline
 * 
 * Installation:
 * npm install openai dotenv
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../data/generated');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const MODEL = 'gpt-4-turbo'; // You can change this to 'gpt-3.5-turbo' for lower costs

// Check if output directory exists, if not create it
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Promisify readline question
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The user's answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Call OpenAI API with a system prompt and user prompt
 * @param {string} systemPrompt - Instructions for the model
 * @param {string} userPrompt - User input/query
 * @returns {Promise<string>} - The API response
 */
async function callOpenAI(systemPrompt, userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Generate subcategories data using OpenAI
 * @param {string} categoryId - The parent category ID
 * @param {string} categoryName - The parent category name
 * @param {Array<string>} subcategoryNames - List of subcategory names
 * @returns {Promise<Object>} - Subcategories data object
 */
async function generateSubcategoriesData(categoryId, categoryName, subcategoryNames) {
  const systemPrompt = `
You are a helpful assistant that generates JSON data for a trivia application. 
Your task is to create subcategory data for the given category and subcategory names.
Each subcategory should have realistic and interesting details.

Follow these guidelines:
1. Generate JSON data in the exact format shown in the example
2. Use the provided category ID and name
3. Create appropriate IDs by converting names to lowercase and replacing spaces with hyphens
4. Create engaging descriptions that accurately describe the subcategory
5. Use realistic image URLs from Unsplash
6. Include appropriate difficulty levels (Easy, Medium, or Hard)
7. Make sure the data is well-formatted JSON
`;

  const exampleJson = {
    "subcategories": [
      {
        "id": "movies",
        "categoryId": "entertainment",
        "name": "Movies",
        "description": "Test your knowledge of cinema and film history",
        "image": "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
        "totalQuizzes": 55,
        "difficulty": "Medium",
        "ageGroup": "12+"
      },
      {
        "id": "tv-shows",
        "categoryId": "entertainment",
        "name": "TV Shows",
        "description": "Challenge yourself with television trivia",
        "image": "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop",
        "totalQuizzes": 48,
        "difficulty": "Easy",
        "ageGroup": "10+"
      }
    ]
  };

  const userPrompt = `
Generate subcategory data for these inputs:
- Category ID: ${categoryId}
- Category Name: ${categoryName}
- Subcategory Names: ${subcategoryNames.join(', ')}

Use this JSON format:
${JSON.stringify(exampleJson, null, 2)}

Return only valid, well-formatted JSON with no additional text or explanations.
`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  
  try {
    // Parse the response as JSON
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing OpenAI subcategories response:', error);
    console.error('Response was:', response);
    throw new Error('Failed to parse subcategories data from OpenAI');
  }
}

/**
 * Generate study subcategories data using OpenAI
 * @param {string} mainTopicId - The parent main topic ID
 * @param {Array<string>} subcategoryNames - List of subcategory names
 * @returns {Promise<Object>} - Study subcategories data object
 */
async function generateStudySubcategoriesData(mainTopicId, subcategoryNames) {
  const systemPrompt = `
You are a helpful assistant that generates JSON data for a trivia study application. 
Your task is to create study subcategory data for the given main topic and subcategory names.
Each study subcategory should have realistic and educational details.

Follow these guidelines:
1. Generate JSON data in the exact format shown in the example
2. Use the provided main topic ID
3. Create appropriate IDs by converting names to lowercase and replacing spaces with hyphens
4. Create educational descriptions that accurately describe the study subcategory
5. Include detailed meta descriptions for SEO
6. Use realistic image URLs from Unsplash
7. Generate relevant popular tags for each subcategory
8. Make sure the data is well-formatted JSON
`;

  const exampleJson = {
    "subcategories": [
      {
        "id": "movies",
        "mainTopicId": "entertainment",
        "name": "Movies",
        "description": "Explore the world of cinema, including films, directors, awards, and film history",
        "metaDescription": "Study materials on film history, movie awards, iconic directors, and significant movements in cinema history.",
        "image": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
        "totalStudyMaterials": 5,
        "popularTags": ["Film History", "Academy Awards", "Directors", "Film Techniques"]
      },
      {
        "id": "music",
        "mainTopicId": "entertainment",
        "name": "Music",
        "description": "Discover the rich history of music, famous artists, and influential genres",
        "metaDescription": "Comprehensive study materials on music history, influential artists, genre evolution, and musical theory and techniques.",
        "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",
        "totalStudyMaterials": 4,
        "popularTags": ["Music History", "Famous Musicians", "Genres", "Music Theory"]
      }
    ]
  };

  const userPrompt = `
Generate study subcategory data for these inputs:
- Main Topic ID: ${mainTopicId}
- Subcategory Names: ${subcategoryNames.join(', ')}

Use this JSON format:
${JSON.stringify(exampleJson, null, 2)}

Return only valid, well-formatted JSON with no additional text or explanations.
`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  
  try {
    // Parse the response as JSON
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing OpenAI study subcategories response:', error);
    console.error('Response was:', response);
    throw new Error('Failed to parse study subcategories data from OpenAI');
  }
}

/**
 * Generate quizzes data using OpenAI
 * @param {string} categoryId - The parent category ID
 * @param {string} categoryName - The parent category name
 * @param {Array<Object>} subcategories - List of subcategory objects
 * @returns {Promise<Object>} - Quizzes data object
 */
async function generateQuizzesData(categoryId, categoryName, subcategories) {
  const systemPrompt = `
You are a helpful assistant that generates JSON data for a trivia application. 
Your task is to create quiz data for the given category and subcategories.
Each quiz should have realistic and engaging details that would interest users.

Follow these guidelines:
1. Generate JSON data in the exact format shown in the example
2. Use the provided category ID and subcategory IDs
3. Create appropriate quiz IDs by converting names to lowercase and replacing spaces with hyphens
4. Create engaging descriptions that accurately describe what the quiz is about
5. Include appropriate difficulty levels (Easy, Medium, or Hard)
6. Generate relevant and specific tags for each quiz
7. Make sure the data is well-formatted JSON
8. Create one quiz for each subcategory
`;

  const exampleJson = {
    "quizzes": [
      {
        "id": "oscar-winners",
        "categoryId": "entertainment",
        "subcategoryId": "movies",
        "name": "Oscar-Winning Films",
        "description": "Test your knowledge about Academy Award-winning movies throughout history.",
        "questionCount": 20,
        "timeLimit": 15,
        "difficulty": "Medium",
        "popularity": 4.8,
        "attempts": 24500,
        "tags": ["Oscars", "Best Picture", "Award Winners"]
      },
      {
        "id": "sitcoms-trivia",
        "categoryId": "entertainment",
        "subcategoryId": "tv-shows",
        "name": "Classic Sitcoms",
        "description": "Challenge yourself with questions about beloved situation comedies from television history.",
        "questionCount": 15,
        "timeLimit": 12,
        "difficulty": "Easy",
        "popularity": 4.6,
        "attempts": 18700,
        "tags": ["Sitcoms", "Comedy", "TV Classics"]
      }
    ]
  };

  const userPrompt = `
Generate quiz data for these inputs:
- Category ID: ${categoryId}
- Category Name: ${categoryName}
- Subcategories: ${JSON.stringify(subcategories.map(s => ({ id: s.id, name: s.name })))}

Use this JSON format:
${JSON.stringify(exampleJson, null, 2)}

Return only valid, well-formatted JSON with no additional text or explanations.
`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  
  try {
    // Parse the response as JSON
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing OpenAI quizzes response:', error);
    console.error('Response was:', response);
    throw new Error('Failed to parse quizzes data from OpenAI');
  }
}

/**
 * Generate questions data using OpenAI
 * @param {string} categoryName - The parent category name
 * @param {Array<Object>} quizzes - List of quiz objects with subcategory info
 * @returns {Promise<Object>} - Questions data object
 */
async function generateQuestionsData(categoryName, quizzes) {
  // We'll generate questions for each quiz separately to keep prompts smaller
  const questionsDataArray = [];
  
  for (const quiz of quizzes) {
    const systemPrompt = `
You are a quiz expert that creates realistic, challenging, and engaging trivia questions. 
Your task is to generate a set of 10 questions for a specific quiz category.
Each question should be well-researched, factually accurate, and interesting.

Follow these guidelines:
1. Generate JSON data in the exact format shown in the example
2. Create 10 questions for the quiz
3. Each question should have 4 options (A, B, C, D)
4. Mark the correct answer and provide a brief, educational explanation
5. Vary the difficulty levels (Easy, Medium, Hard)
6. Ensure questions are diverse and cover different aspects of the topic
7. Make sure the data is well-formatted JSON
`;

    const exampleJson = {
      "id": "oscar-winners",
      "title": "Oscar-Winning Films",
      "category": "Entertainment",
      "subcategory": "Movies",
      "description": "Test your knowledge about Academy Award-winning movies throughout history.",
      "difficulty": "Medium",
      "timeLimit": 15,
      "questionCount": 10,
      "popularity": 4.5,
      "attempts": 10000,
      "tags": ["Oscars", "Best Picture", "Award Winners"],
      "questions": [
        {
          "id": "q1",
          "text": "Which film won the Academy Award for Best Picture in 2020?",
          "options": [
            "1917",
            "Parasite",
            "Joker",
            "Once Upon a Time in Hollywood"
          ],
          "correctAnswer": "Parasite",
          "explanation": "Parasite, directed by Bong Joon-ho, became the first non-English language film to win the Academy Award for Best Picture in 2020.",
          "difficulty": "Medium"
        },
        {
          "id": "q2",
          "text": "Who holds the record for most Academy Award wins for Best Director?",
          "options": [
            "Steven Spielberg",
            "Martin Scorsese",
            "John Ford",
            "Francis Ford Coppola"
          ],
          "correctAnswer": "John Ford",
          "explanation": "John Ford won the Academy Award for Best Director four times for 'The Informer' (1935), 'The Grapes of Wrath' (1940), 'How Green Was My Valley' (1941), and 'The Quiet Man' (1952).",
          "difficulty": "Hard"
        }
      ]
    };

    const userPrompt = `
Generate questions data for this quiz:
- Quiz ID: ${quiz.id}
- Quiz Title: ${quiz.name}
- Category: ${categoryName}
- Subcategory: ${quiz.subcategoryName}
- Description: ${quiz.description}

Create 10 realistic, engaging, and factually accurate questions with 4 options each.
Ensure questions cover different aspects of the topic and vary in difficulty.

Use this JSON format:
${JSON.stringify(exampleJson, null, 2)}

Return only valid, well-formatted JSON with no additional text or explanations.
`;

    const response = await callOpenAI(systemPrompt, userPrompt);
    
    try {
      // Parse the response as JSON
      const questionsData = JSON.parse(response);
      questionsDataArray.push(questionsData);
    } catch (error) {
      console.error(`Error parsing OpenAI questions response for quiz ${quiz.id}:`, error);
      console.error('Response was:', response);
      throw new Error(`Failed to parse questions data for quiz ${quiz.id} from OpenAI`);
    }
  }
  
  return { quizzes: questionsDataArray };
}

/**
 * Main function to generate all data
 */
async function generateData() {
  try {
    console.log('🔍 Trivia App Data Generator using OpenAI');
    console.log('========================================');
    
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY environment variable not set');
      console.log('Please set your OpenAI API key using:');
      console.log('- Create a .env file in the project root with OPENAI_API_KEY=your_api_key');
      console.log('- Or set it in your environment before running the script');
      rl.close();
      return;
    }
    
    // Ask for category ID and name
    const categoryId = await askQuestion('Enter category ID (e.g., "entertainment"): ');
    const categoryName = await askQuestion('Enter category name (e.g., "Entertainment"): ');
    
    // Ask for subcategory information
    console.log('\nNow enter up to 5 subcategories for this category.');
    console.log('Example format: "Action Movies, Classic Movies, TV Shows, Sci-Fi, Music"\n');
    
    const subcategoriesInput = await askQuestion('Enter subcategories (comma-separated): ');
    const subcategoriesList = subcategoriesInput.split(',').map(item => item.trim()).filter(Boolean);
    
    // Limit to 5 subcategories
    const subcategories = subcategoriesList.slice(0, 5);
    
    if (subcategories.length === 0) {
      console.log('❌ No valid subcategories provided. Exiting...');
      rl.close();
      return;
    }
    
    console.log(`\n✅ Generating data for ${subcategories.length} subcategories using OpenAI API...`);
    
    // Step 1: Generate subcategories data
    console.log('\n📝 Generating subcategories data...');
    const subcategoriesData = await generateSubcategoriesData(categoryId, categoryName, subcategories);
    console.log(`✅ Generated data for ${subcategoriesData.subcategories.length} subcategories`);
    
    // Step 2: Generate study subcategories data
    console.log('\n📝 Generating study subcategories data...');
    const studySubcategoriesData = await generateStudySubcategoriesData(categoryId, subcategories);
    console.log(`✅ Generated data for ${studySubcategoriesData.subcategories.length} study subcategories`);
    
    // Step 3: Generate quizzes data
    console.log('\n📝 Generating quizzes data...');
    const quizzesData = await generateQuizzesData(categoryId, categoryName, subcategoriesData.subcategories);
    console.log(`✅ Generated data for ${quizzesData.quizzes.length} quizzes`);
    
    // Step 4: Generate questions data
    console.log('\n📝 Generating questions data...');
    // Add subcategory names to quiz objects for better context in question generation
    const enrichedQuizzes = quizzesData.quizzes.map(quiz => {
      const subcategory = subcategoriesData.subcategories.find(s => s.id === quiz.subcategoryId);
      return {
        ...quiz,
        subcategoryName: subcategory ? subcategory.name : 'Unknown'
      };
    });
    
    const questionsData = await generateQuestionsData(categoryName, enrichedQuizzes);
    console.log(`✅ Generated data for ${questionsData.quizzes.length} sets of questions`);
    
    // Write data to files
    const subcategoriesFilePath = path.join(OUTPUT_DIR, `subcategories_${TIMESTAMP}.json`);
    const studySubcategoriesFilePath = path.join(OUTPUT_DIR, `study_subcategories_${TIMESTAMP}.json`);
    const quizzesFilePath = path.join(OUTPUT_DIR, `quizzes_${TIMESTAMP}.json`);
    const questionsFilePath = path.join(OUTPUT_DIR, `questions_${TIMESTAMP}.json`);
    
    fs.writeFileSync(subcategoriesFilePath, JSON.stringify(subcategoriesData, null, 2));
    fs.writeFileSync(studySubcategoriesFilePath, JSON.stringify(studySubcategoriesData, null, 2));
    fs.writeFileSync(quizzesFilePath, JSON.stringify(quizzesData, null, 2));
    fs.writeFileSync(questionsFilePath, JSON.stringify(questionsData, null, 2));
    
    console.log('\n✅ Data generation complete!');
    console.log('\nGenerated files:');
    console.log(`1. ${subcategoriesFilePath}`);
    console.log(`2. ${studySubcategoriesFilePath}`);
    console.log(`3. ${quizzesFilePath}`);
    console.log(`4. ${questionsFilePath}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Review the generated files');
    console.log('2. Manually copy the data to your actual JSON files');
    console.log('3. Make any necessary adjustments to match your needs');
    
    rl.close();
  } catch (error) {
    console.error('❌ Error generating data:', error);
    rl.close();
  }
}

// Start the data generation process
generateData(); 