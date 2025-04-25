// Existing interfaces
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  totalQuizzes: number;
  totalAttempts: number;
  averageAccuracy: number;
  difficulty?: string;
  ageGroup?: string;
  popularTags?: string[];
  featured?: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  totalQuizzes: number;
  difficulty?: string;
  ageGroup?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Quiz {
  id: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  image?: string;
  difficulty: string;
  timeLimit: number;
  includeExplanations: boolean;
  quizContent?: string;  // Content from content-quiz.json
  questionCount: number;
  popularity: number;
  attempts: number;
  tags: string[];
  questions: Question[];
  studyTopicId?: string;
  lastUpdated: string;
  
  // Added for backward compatibility
  category?: string;
  subcategory?: string;
}

// Study related interfaces
export interface StudyTopic {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  description: string;
  metaDescription: string; // For SEO
  // Allow content to be either a string (HTML content) or the structured format
  content: string | { 
    introduction: string;
    sections: Array<{
      title: string;
      content: string;
      paragraphs?: string[];
      image?: string | {
        src?: string;
        url?: string;
        alt: string;
        caption: string;
      };
      imageCaption?: string;
      list?: {
        type: 'ordered' | 'unordered' | string;
        items: string[];
      };
      quote?: string | {
        text: string;
        author?: string;
        context?: string;
      };
      table?: {
        caption?: string;
        headers: string[];
        rows: string[][];
      };
      tables?: {
        caption?: string;
        headers: string[];
        rows: string[][];
      };
      // Add a catch-all property to handle any additional fields
      [key: string]: any;
    }>;
    conclusion: string;
    [key: string]: any; // Allow for additional properties in content
  }; 
  image: string;
  difficulty: string;
  readingTime: number; // in minutes
  relatedQuizIds: string[];
  relatedTopicIds: string[];
  tags: string[];
  lastUpdated: string;
  sections?: {
    title: string;
    content: string;
  }[];
}

// New interface for main study topics
export interface StudyMainTopic {
  id: string;
  name: string;
  description: string;
  metaDescription: string; // For SEO
  icon: string;
  image: string;
  totalStudyMaterials: number;
  relatedQuizzes: number;
  popularTags: string[];
  featured: boolean;
}

// New interface for study subcategories
export interface StudySubcategory {
  id: string;
  mainTopicId: string;
  name: string;
  description: string;
  metaDescription: string; // For SEO
  image: string;
  totalStudyMaterials: number;
  popularTags: string[];
}

export interface StudyProgress {
  topicId: string;
  userId: string;
  completed: boolean;
  lastAccessed: string;
  timeSpent: number; // in seconds
  notes?: string;
  bookmarks?: string[];
}

export interface StudyMaterial {
  id: string;
  topicId: string;
  type: 'article' | 'video' | 'document';
  title: string;
  description: string;
  content: string;
  url?: string;
  duration?: number; // in minutes
  order: number;
}

export interface TrendingQuiz {
  id: string;
  title: string;
  category: string;
  image: string;
  participants: number;
  duration: number;
  difficulty: string;
}

export interface Stats {
  activeUsers: string;
  totalQuizzes: string;
  categories: string;
  userRating: string;
}