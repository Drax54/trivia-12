"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Wand2,
  ChevronRight,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from "@/components/ui/slider";
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Generation limit tracking interface
interface QuizGenerationLimit {
  count: number;
  resetDate: string; // ISO string of when the limit should reset
}

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

// Helper function to check if user has reached generation limit
const checkQuizGenerationLimit = (): boolean => {
  try {
    const savedLimitData = localStorage.getItem('quizGenerationLimit');
    
    if (!savedLimitData) {
      // First time user, initialize limit
      const newLimit: QuizGenerationLimit = {
        count: 0,
        resetDate: getNextDayResetDate()
      };
      localStorage.setItem('quizGenerationLimit', JSON.stringify(newLimit));
      return false; // No limit reached
    }
    
    const limitData: QuizGenerationLimit = JSON.parse(savedLimitData);
    
    // Check if reset date has passed
    if (new Date() > new Date(limitData.resetDate)) {
      // Reset the limit
      const newLimit: QuizGenerationLimit = {
        count: 0,
        resetDate: getNextDayResetDate()
      };
      localStorage.setItem('quizGenerationLimit', JSON.stringify(newLimit));
      return false; // No limit reached after reset
    }
    
    // Check if limit reached
    return limitData.count >= 20;
  } catch (error) {
    console.error("[DEBUG] Error checking quiz generation limit:", error);
    return false; // If error, don't block generation
  }
};

// Helper function to increment generation count
const incrementGenerationCount = (): void => {
  try {
    const savedLimitData = localStorage.getItem('quizGenerationLimit');
    
    if (!savedLimitData) {
      // Initialize with first use
      const newLimit: QuizGenerationLimit = {
        count: 1,
        resetDate: getNextDayResetDate()
      };
      localStorage.setItem('quizGenerationLimit', JSON.stringify(newLimit));
      return;
    }
    
    const limitData: QuizGenerationLimit = JSON.parse(savedLimitData);
    
    // Check if reset date has passed
    if (new Date() > new Date(limitData.resetDate)) {
      // Reset and start with 1
      const newLimit: QuizGenerationLimit = {
        count: 1,
        resetDate: getNextDayResetDate()
      };
      localStorage.setItem('quizGenerationLimit', JSON.stringify(newLimit));
      return;
    }
    
    // Increment count
    limitData.count += 1;
    localStorage.setItem('quizGenerationLimit', JSON.stringify(limitData));
  } catch (error) {
    console.error("[DEBUG] Error incrementing generation count:", error);
  }
};

// Helper to get next day (midnight) as reset date
const getNextDayResetDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
};

// Helper to get time until reset in hours and minutes
const getTimeUntilReset = (): string => {
  try {
    const savedLimitData = localStorage.getItem('quizGenerationLimit');
    if (!savedLimitData) return "";
    
    const limitData: QuizGenerationLimit = JSON.parse(savedLimitData);
    const resetTime = new Date(limitData.resetDate).getTime();
    const currentTime = new Date().getTime();
    const diffMs = resetTime - currentTime;
    
    // If already passed, return empty
    if (diffMs <= 0) return "";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  } catch (error) {
    return "";
  }
};

// Helper function to get remaining generations today
const getRemainingGenerations = (): number => {
  try {
    const savedLimitData = localStorage.getItem('quizGenerationLimit');
    
    if (!savedLimitData) {
      return 20; // Default max
    }
    
    const limitData: QuizGenerationLimit = JSON.parse(savedLimitData);
    
    // Check if reset date has passed
    if (new Date() > new Date(limitData.resetDate)) {
      return 20; // Reset to max
    }
    
    // Return remaining
    return Math.max(0, 20 - limitData.count);
  } catch (error) {
    console.error("[DEBUG] Error getting remaining generations:", error);
    return 20; // If error, return max
  }
};

export function CreateQuizClient() {
  console.log('[CLIENT] Initializing quiz creation form');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState(20);
  const [formData, setFormData] = useState({
    category: '',
    topics: '',
    questionCount: 20,
    difficulty: '',
    timeLimit: 30,
    includeExplanations: true,
    allowRevealAnswer: true,
    revealLimit: 5,
  });

  // Check if user has reached limit on page load
  useEffect(() => {
    const hasReachedLimit = checkQuizGenerationLimit();
    setLimitReached(hasReachedLimit);
    setRemainingTime(getTimeUntilReset());
    setRemainingGenerations(getRemainingGenerations());
    
    // Update remaining time every minute
    const intervalId = setInterval(() => {
      setRemainingTime(getTimeUntilReset());
      // Also recheck limit in case day changed
      const updatedLimit = checkQuizGenerationLimit();
      if (limitReached && !updatedLimit) {
        // Limit was reset
        setLimitReached(false);
        setRemainingGenerations(getRemainingGenerations());
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [limitReached]);

  const loadingMessages = [
    "Searching through the knowledge universe...",
    "Crafting the perfect questions just for you...",
    "Balancing difficulty levels for maximum fun...",
    "Consulting with trivia experts...",
    "Double-checking all the facts...",
    "Polishing those tricky answer options...",
    "Adding a sprinkle of challenge...",
    "Making sure this quiz is going to be amazing..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessage(prevMessage => 
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        );
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, loadingMessages]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleGenerateQuiz = async () => {
    console.log('[CLIENT] Handling generate quiz request', formData);
    
    // Check if limit reached
    if (checkQuizGenerationLimit()) {
      setLimitReached(true);
      setRemainingTime(getTimeUntilReset());
      setShowLimitDialog(true);
      return;
    }
    
    // Validate required fields
    if (!formData.category) {
      setError("Please select a category");
      return;
    }
    if (!formData.topics) {
      setError("Please enter at least one topic");
      return;
    }
    if (!formData.difficulty) {
      setError("Please select a difficulty level");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const requestData = {
        category: categories.find(c => c.id === formData.category)?.name,
        questionCount: formData.questionCount,
        difficulty: formData.difficulty,
        topics: formData.topics,
        includeExplanations: formData.includeExplanations,
        showAllQuestions: true, // Always show all questions on one page
      };
      
      console.log("[DEBUG] Sending API request to /api/generate-quiz:", JSON.stringify(requestData, null, 2));
      console.time("[DEBUG] API Request Time");
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.timeEnd("[DEBUG] API Request Time");
      console.log("[DEBUG] API Response Status:", response.status, response.statusText);
      
      let data;
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[DEBUG] API Error Response:", errorData);
        
        // Check for rate limiting from server
        if (response.status === 429) {
          // Server says we hit limit
          setLimitReached(true);
          setRemainingTime(getTimeUntilReset());
          setRemainingGenerations(0);
          setIsGenerating(false);
          setShowLimitDialog(true);
          throw new Error(errorData.error || 'Daily quiz generation limit reached');
        }
        
        throw new Error(errorData.error || 'Failed to generate quiz');
      } 
      
      data = await response.json();
      console.log("[DEBUG] API Success Response:", {
        questionsCount: data.questions?.length,
        firstQuestion: data.questions?.[0]?.question,
      });
      
      // Increment generation count after successful generation
      incrementGenerationCount();
      
      // Update UI states
      const hasReachedLimit = checkQuizGenerationLimit();
      setLimitReached(hasReachedLimit);
      setRemainingGenerations(getRemainingGenerations());
      
      // Generate a unique ID for this quiz that will be used for both storage and navigation
      const quizId = Date.now().toString();
      
      // Create quiz data object with all necessary fields
      const quizData = {
        ...formData,
        questions: data.questions,
        createdAt: new Date().toISOString(),
        title: `${formData.topics} (${formData.difficulty})`,
        description: `A custom trivia quiz about ${formData.topics} in the ${formData.category} category with ${formData.questionCount} ${formData.difficulty} questions.`,
        showAllQuestions: true,
        id: quizId,
        allowRevealAnswer: true,
        // Set reveal limit based on question count
        revealLimit: formData.questionCount <= 5 ? 1 : 
                    formData.questionCount <= 10 ? 3 : 5
      };
      
      // Store in localStorage and ensure it's committed before navigation
      await storeQuizAndNavigate(quizData, quizId);
      
      console.log("[DEBUG] Storage complete, navigating directly to quiz page");
      
      // Navigate directly to the quiz page, skipping the redirect
      window.location.href = `/quiz/generated/${quizId}`;
    } catch (err) {
      console.error('[DEBUG] Failed to generate quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
      setIsGenerating(false);
    }
  };

  console.log('[CLIENT] Rendering quiz creation form');
  
  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary mb-2">
            <Wand2 className="w-5 h-5" />
            <span className="font-medium">AI-Powered Trivia Creator</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Perfect Trivia Quiz</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Customize your quiz with our AI-powered trivia generator. 
            Select your preferences and we&apos;ll create engaging questions tailored just for you.
          </p>
          
          {/* Generation usage indicator */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <Info className="w-4 h-4" />
                <span>Daily quiz generations remaining:</span>
              </div>
              <span className="font-medium">{remainingGenerations} of 20</span>
            </div>
            <Progress 
              value={remainingGenerations * 5} 
              className={`h-2 ${
                remainingGenerations === 0 
                  ? "text-red-500" 
                  : remainingGenerations === 1 
                    ? "text-amber-500" 
                    : "text-emerald-500"
              }`} 
            />
            {limitReached && (
              <p className="text-xs text-amber-700 mt-1">Resets in {remainingTime}</p>
            )}
          </div>
          
          {/* Generation limit warning */}
          {limitReached && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-amber-800">Daily quiz generation limit reached</p>
                <p className="text-sm text-amber-700">
                  You can create 20 quizzes per day. Limit resets in {remainingTime}.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Single-step Quiz Creation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Category and Topic */}
            <div className="space-y-4">
              <motion.div variants={itemVariants}>
                <Label className="text-base font-semibold">Select Category</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        formData.category === category.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{category.icon}</div>
                      <div className="font-medium text-sm">{category.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label className="text-base font-semibold">Topic (Required)</Label>
                <Input
                  placeholder="E.g., Oscar winners, 90s films, World Cup"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  className="mt-2"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Specific topics to focus questions on (be specific for better results)
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Include Explanations</Label>
                    <p className="text-sm text-gray-500">Show explanations for answers</p>
                  </div>
                  <Switch
                    checked={formData.includeExplanations}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeExplanations: checked })}
                  />
                </div>
              </motion.div>
            </div>

            {/* Right Column - Quiz Settings */}
            <div className="space-y-4">
              <motion.div variants={itemVariants}>
                <Label className="text-base font-semibold">Difficulty Level</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, difficulty: level.value })}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                        formData.difficulty === level.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className={`absolute inset-y-0 left-0 w-1 ${level.color}`} />
                      <span className="font-medium">{level.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label className="text-base font-semibold">Number of Questions</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.questionCount]}
                    onValueChange={(value) => setFormData({ ...formData, questionCount: value[0] })}
                    max={20}
                    min={5}
                    step={5}
                    className="py-3"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>5 questions</span>
                    <span className="font-medium text-primary">{formData.questionCount} questions</span>
                    <span>20 questions</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label className="text-base font-semibold">Time Limit (minutes)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.timeLimit]}
                    onValueChange={(value) => setFormData({ ...formData, timeLimit: value[0] })}
                    max={60}
                    min={5}
                    step={5}
                    className="py-3"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>5 min</span>
                    <span className="font-medium text-primary">{formData.timeLimit} min</span>
                    <span>60 min</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Generate Button */}
          <motion.div 
            variants={itemVariants}
            className="pt-4 border-t"
          >
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg rounded-xl"
              onClick={handleGenerateQuiz}
              disabled={isGenerating || limitReached}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              {limitReached 
                ? "Daily Limit Reached" 
                : isGenerating 
                  ? "Generating..." 
                  : `Generate Quiz (${remainingGenerations} left today)`}
            </Button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Loading Overlay - conditionally rendered on top */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/90 via-white/90 to-blue-50/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 w-full max-w-md mx-4"
          >
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wand2 className="w-10 h-10 text-primary" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-primary"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Generating Your Quiz</h2>
            
            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-gray-600 mb-5 text-center"
            >
              {loadingMessage}
            </motion.p>
            
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div
                animate={{ 
                  width: ["0%", "100%"],
                  transition: { duration: 10, repeat: Infinity }
                }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Limit reached dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily Limit Reached</DialogTitle>
            <DialogDescription>
              You can create up to 20 quizzes per day. This helps us maintain quality and ensure our service is available to everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-4 rounded-lg mt-2">
            <p className="font-medium">Your limit will reset in {remainingTime}</p>
            <p className="text-sm text-gray-600 mt-1">Come back tomorrow to create more quizzes!</p>
            <p className="text-sm text-gray-600 mt-3">In the meantime, you can still play any of our pre-made quizzes from the homepage.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLimitDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 