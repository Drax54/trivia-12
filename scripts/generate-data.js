/**
 * Data Generator Script for Trivia App
 * 
 * This script generates JSON data for subcategories, quizzes, and questions
 * based on user input. It creates sample data that follows the same structure
 * as the existing JSON files.
 * 
 * Usage: node generate-data.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../data/generated');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

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
 * Generate subcategory data
 * @param {string} categoryId - The parent category ID
 * @param {string} name - The subcategory name
 * @returns {Object} - Subcategory data object
 */
function generateSubcategoryData(categoryId, name) {
  // Create an ID by converting name to lowercase and replacing spaces with hyphens
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  // Sample images for different types of subcategories
  const movieImages = [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop"
  ];
  
  // Pick a random image
  const randomImage = movieImages[Math.floor(Math.random() * movieImages.length)];
  
  // Generate random quiz count between 3 and 8
  const quizCount = Math.floor(Math.random() * 6) + 3;
  
  // Random difficulty levels
  const difficulties = ["Easy", "Medium", "Hard"];
  const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  
  // Generate subcategory data
  return {
    id,
    categoryId,
    name,
    description: `Test your knowledge about ${name}`,
    image: randomImage,
    totalQuizzes: quizCount,
    difficulty: randomDifficulty,
    ageGroup: "12+"
  };
}

/**
 * Generate study subcategory data
 * @param {string} mainTopicId - The parent main topic ID
 * @param {string} name - The subcategory name
 * @returns {Object} - Study subcategory data object
 */
function generateStudySubcategoryData(mainTopicId, name) {
  // Create an ID by converting name to lowercase and replacing spaces with hyphens
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  // Sample images for different types of subcategories
  const movieImages = [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop"
  ];
  
  // Pick a random image
  const randomImage = movieImages[Math.floor(Math.random() * movieImages.length)];
  
  // Generate random study materials count between 3 and 6
  const materialsCount = Math.floor(Math.random() * 4) + 3;
  
  // Generate popular tags based on the subcategory name
  const tags = [];
  tags.push(`${name} History`);
  tags.push(`Famous ${name}`);
  tags.push(`${name} Classics`);
  tags.push(`Modern ${name}`);
  
  // Generate study subcategory data
  return {
    id,
    mainTopicId,
    name,
    description: `Explore the world of ${name}, including history, notable works, and key figures`,
    metaDescription: `Study materials on ${name.toLowerCase()} history, significant works, influential figures, and trends throughout time.`,
    image: randomImage,
    totalStudyMaterials: materialsCount,
    popularTags: tags
  };
}

/**
 * Generate quiz data
 * @param {string} categoryId - The parent category ID
 * @param {string} subcategoryId - The parent subcategory ID
 * @param {string} name - The quiz name
 * @returns {Object} - Quiz data object
 */
function generateQuizData(categoryId, subcategoryId, name) {
  // Create an ID by converting name to lowercase and replacing spaces with hyphens
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  // Generate random question count between 10 and 25
  const questionCount = Math.floor(Math.random() * 16) + 10;
  
  // Random time limit between 10 and 20 minutes
  const timeLimit = Math.floor(Math.random() * 11) + 10;
  
  // Random difficulty levels
  const difficulties = ["Easy", "Medium", "Hard"];
  const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  
  // Random popularity between 4.0 and 5.0
  const popularity = (Math.random() * 1 + 4).toFixed(1);
  
  // Random attempts between 5000 and 15000
  const attempts = Math.floor(Math.random() * 10001) + 5000;
  
  // Generate tags based on the quiz name
  const tags = [];
  
  // Split the name and use parts as tags
  const nameParts = name.split(' ');
  for (const part of nameParts) {
    if (part.length > 3) {
      tags.push(part);
    }
  }
  
  // Add additional generic tags
  if (name.includes("Classic")) {
    tags.push("Classics");
  }
  if (name.includes("Modern")) {
    tags.push("Modern");
  }
  
  // Ensure we have at least 3 tags
  while (tags.length < 3) {
    const additionalTags = ["Popular", "Fan Favorites", "Must-See", "Iconic", "Award-Winning"];
    const randomTag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
    if (!tags.includes(randomTag)) {
      tags.push(randomTag);
    }
  }
  
  // Generate quiz data
  return {
    id,
    categoryId,
    subcategoryId,
    name,
    description: `Test your knowledge about ${name} in this engaging quiz.`,
    questionCount,
    timeLimit,
    difficulty: randomDifficulty,
    popularity: parseFloat(popularity),
    attempts,
    tags
  };
}

/**
 * Generate questions data for a quiz
 * @param {string} quizId - The parent quiz ID
 * @param {string} quizTitle - The quiz title
 * @param {string} category - The category name
 * @param {string} subcategory - The subcategory name
 * @returns {Object} - Questions data object
 */
function generateQuestionsData(quizId, quizTitle, category, subcategory) {
  // Create questions data object structure
  const questionsData = {
    id: quizId,
    title: quizTitle,
    category,
    subcategory,
    description: `Test your knowledge about ${quizTitle}.`,
    difficulty: "Medium",
    timeLimit: 15,
    questionCount: 10,
    popularity: 4.5,
    attempts: 10000,
    tags: [subcategory, "Knowledge Test", "Trivia"],
    questions: []
  };
  
  // For movies subcategory, generate relevant movie questions
  if (subcategory.includes("Movies") || subcategory.includes("Film") || subcategory.includes("Cinema")) {
    const movieQuestions = [
      {
        id: "q1",
        text: `What year was the first ${quizTitle} film released?`,
        options: ["1977", "1982", "1994", "2001"],
        correctAnswer: "1994",
        explanation: `The first ${quizTitle} film was released in 1994 and was directed by a visionary filmmaker.`,
        difficulty: "Medium"
      },
      {
        id: "q2",
        text: `Who directed the most famous ${quizTitle} movie?`,
        options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Quentin Tarantino"],
        correctAnswer: "Christopher Nolan",
        explanation: `Christopher Nolan directed the most acclaimed ${quizTitle} film, which won multiple awards.`,
        difficulty: "Easy"
      },
      {
        id: "q3",
        text: `Which actor starred in the most ${quizTitle} films?`,
        options: ["Tom Hanks", "Leonardo DiCaprio", "Brad Pitt", "Denzel Washington"],
        correctAnswer: "Leonardo DiCaprio",
        explanation: `Leonardo DiCaprio has starred in the most ${quizTitle} films throughout his career.`,
        difficulty: "Medium"
      },
      {
        id: "q4",
        text: `Which ${quizTitle} film won the most Academy Awards?`,
        options: ["The Godfather", "Titanic", "The Lord of the Rings: The Return of the King", "Parasite"],
        correctAnswer: "Titanic",
        explanation: `Titanic won 11 Academy Awards, tying for the most Oscars won by a single film.`,
        difficulty: "Hard"
      },
      {
        id: "q5",
        text: `What is the highest-grossing ${quizTitle} film of all time?`,
        options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"],
        correctAnswer: "Avatar",
        explanation: `Avatar, directed by James Cameron, is the highest-grossing film of all time with over $2.9 billion worldwide.`,
        difficulty: "Medium"
      },
      {
        id: "q6",
        text: `Which ${quizTitle} genre is known for its suspenseful music and tense atmosphere?`,
        options: ["Comedy", "Romance", "Horror", "Documentary"],
        correctAnswer: "Horror",
        explanation: `Horror films are characterized by suspenseful music and tense atmosphere designed to frighten viewers.`,
        difficulty: "Easy"
      },
      {
        id: "q7",
        text: `What technology revolutionized ${quizTitle} in the early 21st century?`,
        options: ["CGI", "3D", "IMAX", "Dolby Sound"],
        correctAnswer: "CGI",
        explanation: `Computer-generated imagery (CGI) revolutionized filmmaking by enabling the creation of realistic visual effects and virtual environments.`,
        difficulty: "Medium"
      },
      {
        id: "q8",
        text: `Which film festival is considered the most prestigious for ${quizTitle}?`,
        options: ["Sundance", "Cannes", "Venice", "Toronto"],
        correctAnswer: "Cannes",
        explanation: `The Cannes Film Festival is widely regarded as the most prestigious film festival in the world.`,
        difficulty: "Hard"
      },
      {
        id: "q9",
        text: `What was the first feature-length ${quizTitle} with synchronized sound?`,
        options: ["The Jazz Singer", "Steamboat Willie", "The Great Train Robbery", "Metropolis"],
        correctAnswer: "The Jazz Singer",
        explanation: `The Jazz Singer (1927) was the first feature-length motion picture with synchronized dialogue sequences.`,
        difficulty: "Hard"
      },
      {
        id: "q10",
        text: `Which ${quizTitle} cinematography technique involves moving the camera on a track?`,
        options: ["Pan", "Tilt", "Dolly", "Zoom"],
        correctAnswer: "Dolly",
        explanation: `A dolly shot is a camera technique where the camera is moved toward or away from the subject on a wheeled platform.`,
        difficulty: "Medium"
      }
    ];
    
    questionsData.questions = movieQuestions;
  } else {
    // Generic questions for other subcategories
    for (let i = 1; i <= 10; i++) {
      questionsData.questions.push({
        id: `q${i}`,
        text: `Sample question ${i} about ${quizTitle}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option B",
        explanation: `This is the explanation for question ${i} about ${quizTitle}.`,
        difficulty: i % 3 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy"
      });
    }
  }
  
  return questionsData;
}

/**
 * Main function to generate all data
 */
async function generateData() {
  try {
    console.log('🔍 Trivia App Data Generator');
    console.log('===========================');
    
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
    
    console.log(`\n✅ Generating data for ${subcategories.length} subcategories...`);
    
    // Create data containers
    const subcategoriesData = { subcategories: [] };
    const studySubcategoriesData = { subcategories: [] };
    const quizzesData = { quizzes: [] };
    const questionsDataArray = [];
    
    // Generate data for each subcategory
    for (const subcategoryName of subcategories) {
      console.log(`\n📋 Generating data for "${subcategoryName}"...`);
      
      // Generate subcategory
      const subcategoryData = generateSubcategoryData(categoryId, subcategoryName);
      subcategoriesData.subcategories.push(subcategoryData);
      
      // Generate study subcategory
      const studySubcategoryData = generateStudySubcategoryData(categoryId, subcategoryName);
      studySubcategoriesData.subcategories.push(studySubcategoryData);
      
      // Generate one quiz for this subcategory
      const quizName = `${subcategoryName} Trivia`;
      const quizData = generateQuizData(categoryId, subcategoryData.id, quizName);
      quizzesData.quizzes.push(quizData);
      
      // Generate questions for this quiz
      const questionsData = generateQuestionsData(quizData.id, quizName, categoryName, subcategoryName);
      questionsDataArray.push(questionsData);
      
      console.log(`✅ Generated data for "${subcategoryName}" subcategory and "${quizName}" quiz`);
    }
    
    // Write data to files
    const subcategoriesFilePath = path.join(OUTPUT_DIR, `subcategories_${TIMESTAMP}.json`);
    const studySubcategoriesFilePath = path.join(OUTPUT_DIR, `study_subcategories_${TIMESTAMP}.json`);
    const quizzesFilePath = path.join(OUTPUT_DIR, `quizzes_${TIMESTAMP}.json`);
    const questionsFilePath = path.join(OUTPUT_DIR, `questions_${TIMESTAMP}.json`);
    
    fs.writeFileSync(subcategoriesFilePath, JSON.stringify(subcategoriesData, null, 2));
    fs.writeFileSync(studySubcategoriesFilePath, JSON.stringify(studySubcategoriesData, null, 2));
    fs.writeFileSync(quizzesFilePath, JSON.stringify(quizzesData, null, 2));
    
    // Create a questions file format that matches the original
    const formattedQuestionsData = { quizzes: questionsDataArray };
    fs.writeFileSync(questionsFilePath, JSON.stringify(formattedQuestionsData, null, 2));
    
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