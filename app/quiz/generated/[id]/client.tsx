"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, X, ArrowLeft, Brain, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '@/lib/quiz-generator';
import { cn } from '@/lib/utils';

interface StoredQuiz {
  category: string;
  questionCount: number;
  difficulty: string;
  timeLimit: number;
  questions: QuizQuestion[];
  allowRevealAnswer: boolean;
  revealLimit: number;
  includeExplanations: boolean;
  title: string;
  description: string;
  showAllQuestions?: boolean;
  id?: string;
}

declare global {
  interface Window {
    quizDataLoaded?: boolean;
  }
}

export default function GeneratedQuizClient({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [initialRender, setInitialRender] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // First mount effect - hydration check
  useEffect(() => {
    setIsHydrated(true);
    
    // Check if quiz data is already available immediately
    const quizId = params.id;
    let quizData = localStorage.getItem(`quiz_${quizId}`);
    
    if (!quizData) {
      quizData = localStorage.getItem('generatedQuiz');
    }
    
    if (quizData) {
      try {
        const parsedQuiz = JSON.parse(quizData);
        console.log("[DEBUG CLIENT] Found quiz data immediately");
        setQuiz(parsedQuiz);
        setTimeRemaining(parsedQuiz.timeLimit * 60);
        window.quizDataLoaded = true;
        
        // Hide loading screen quickly
        setTimeout(() => {
          setIsLoading(false);
          const loadingOverlay = document.getElementById('quiz-loading-overlay');
          if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
              loadingOverlay.style.display = 'none';
            }, 500);
          }
        }, 500);
      } catch (error) {
        console.error("[DEBUG CLIENT] Error parsing immediate quiz data:", error);
      }
    }
    
    // This timeout ensures we don't flash loading states during hydration
    const timer = setTimeout(() => {
      setInitialRender(false);
    }, 100);
    
    // Set a maximum loading time to prevent infinite loading
    const maxLoadingTimer = setTimeout(() => {
      setIsLoading(false);
      console.log("[DEBUG CLIENT] Maximum loading time reached, forcing loading to complete");
    }, 10000); // 10 seconds max loading time
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxLoadingTimer);
    }
  }, [params.id]);

  // Load quiz data with retry mechanism
  useEffect(() => {
    if (!isHydrated) return;
    
    // If we already successfully loaded data, don't retry
    if (window.quizDataLoaded && quiz) {
      setIsLoading(false);
      return;
    }
    
    const loadQuiz = () => {
      const quizId = params.id;
      console.log(`[DEBUG CLIENT] Loading quiz with ID: ${quizId}, attempt: ${retryCount + 1}`);
      
      // Try all storage locations
      let quizData = localStorage.getItem(`quiz_${quizId}`);
      
      if (!quizData) {
        quizData = localStorage.getItem('generatedQuiz');
      }
      
      if (!quizData) {
        quizData = sessionStorage.getItem(`quiz_${quizId}`);
      }
      
      if (quizData) {
        try {
          const parsedQuiz = JSON.parse(quizData);
          console.log("[DEBUG CLIENT] Successfully loaded quiz data");
          
          // Sync to all storage locations for future loads
          localStorage.setItem(`quiz_${quizId}`, quizData);
          localStorage.setItem('generatedQuiz', quizData);
          sessionStorage.setItem(`quiz_${quizId}`, quizData);
          
          // Set global flag to indicate data is loaded
          window.quizDataLoaded = true;
          
          // No delay needed now since we're coming directly from generation
          setQuiz(parsedQuiz);
          setTimeRemaining(parsedQuiz.timeLimit * 60);
          setIsLoading(false);
        } catch (error) {
          console.error("[DEBUG CLIENT] Error parsing quiz data:", error);
          retryQuizLoad();
        }
      } else {
        console.log("[DEBUG CLIENT] Quiz not found, attempting retry");
        retryQuizLoad();
      }
    };
    
    const retryQuizLoad = () => {
      if (retryCount < 5) {
        const timeout = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 300 * (retryCount + 1)); // Exponential backoff
        
        return () => clearTimeout(timeout);
      } else {
        console.error("[DEBUG CLIENT] Max retry attempts reached, quiz not found");
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [isHydrated, params.id, retryCount, quiz]);

  // Hide the server-side splash screen once we're done loading
  useEffect(() => {
    if (!isLoading && !initialRender) {
      const loadingOverlay = document.getElementById('quiz-loading-overlay');
      if (loadingOverlay) {
        // Fade out
        loadingOverlay.style.opacity = '0';
        
        // Then hide completely
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
        
        console.log("[DEBUG CLIENT] Hiding loading overlay");
      } else {
        console.log("[DEBUG CLIENT] Loading overlay not found");
      }
    }
  }, [isLoading, initialRender]);

  useEffect(() => {
    if (quizStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            clearInterval(timer);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  useEffect(() => {
    // Calculate score whenever all questions are answered
    if (quiz && Object.keys(selectedAnswers).length === quiz.questions.length) {
      let correctCount = 0;
      quiz.questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setQuizCompleted(true);
    }
  }, [selectedAnswers, quiz]);

  // Removing the useEffect from its current position
  const questionsAnswered = Object.keys(selectedAnswers).length;
  const progress = quiz ? Math.round((questionsAnswered / quiz.questions.length) * 100) : 0;

  // Add an additional useEffect for when quiz data loads
  useEffect(() => {
    // When quiz data loads, ensure the loading screen disappears
    if (quiz && isHydrated) {
      // Safety measure: try to hide the loading screen immediately when quiz data is loaded
      const loadingOverlay = document.getElementById('quiz-loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
        console.log("[DEBUG CLIENT] Quiz data loaded, hiding loading overlay");
      }
      
      // Set loading false (belt-and-suspenders approach)
      setIsLoading(false);
    }
  }, [quiz, isHydrated]);

  // Add an effect to scroll to top when quiz state changes
  useEffect(() => {
    // Scroll to top whenever quiz is started or completed
    if (quizStarted || quizCompleted) {
      window.scrollTo(0, 0);
    }
  }, [quizStarted, quizCompleted]);

  // Modified quiz not found state to account for loading
  if (!quiz) {
    // Only show the "not found" message if we're not loading and we've tried several times
    if (!isLoading && retryCount >= 5) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <div className="text-center max-w-md px-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h1>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find the quiz you&apos;re looking for. It may have expired or been removed.
              </p>
              <Button 
                onClick={() => window.location.href = '/create'}
                className="bg-primary hover:bg-primary/90 text-white w-full"
              >
                Create New Quiz
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // Otherwise, return null so we don't render anything and let the loading overlay show
    return null;
  }

  const remainingReveals = quiz.allowRevealAnswer ? quiz.revealLimit - revealedAnswers.length : 0;
  const canReveal = quiz.allowRevealAnswer && remainingReveals > 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    // Scroll to top when quiz starts
    window.scrollTo(0, 0);
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleRevealAnswer = (questionIndex: number) => {
    if (canReveal && !revealedAnswers.includes(questionIndex)) {
      setRevealedAnswers(prev => [...prev, questionIndex]);
    }
  };

  const handleSubmitQuiz = () => {
    // Count unanswered questions
    const unansweredCount = quiz.questions.length - Object.keys(selectedAnswers).length;
    
    if (unansweredCount > 0) {
      const confirm = window.confirm(`You have ${unansweredCount} unanswered questions. Do you want to submit anyway?`);
      if (!confirm) return;
    }
    
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setQuizCompleted(true);
    // Scroll to top when quiz completes
    window.scrollTo(0, 0);
  };

  if (!quizStarted) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6 grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary mb-2">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium text-sm">AI-Generated Quiz</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {quiz.title}
                </h1>
                
                <p className="text-gray-600">
                  {quiz.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex flex-col justify-between bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-sm border border-white/20 backdrop-blur">
                    <div className="text-xs font-medium text-white/70">Questions</div>
                    <div className="text-xl font-bold">{quiz.questionCount}</div>
                  </div>
                  
                  <div className="flex flex-col justify-between bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-sm border border-white/20 backdrop-blur">
                    <div className="text-xs font-medium text-white/70">Time Limit</div>
                    <div className="text-xl font-bold">{quiz.timeLimit} min</div>
                  </div>

                  <div className="flex flex-col justify-between bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-sm border border-white/20 backdrop-blur">
                    <div className="text-xs font-medium text-white/70">Difficulty</div>
                    <div className="text-xl font-bold capitalize">{quiz.difficulty}</div>
                  </div>

                  <div className="flex flex-col justify-between bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm border border-white/20 backdrop-blur">
                    <div className="text-xs font-medium text-white/70">Reveals Left</div>
                    <div className="text-xl font-bold">{quiz.revealLimit}</div>
                  </div>
                </div>
              </div>

              <div className="w-full h-[250px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                <Brain className="w-32 h-32 text-primary/20" />
              </div>
            </div>

            <div className="p-6 border-t">
              <Button
                size="lg"
                onClick={handleStartQuiz}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg w-full md:w-auto rounded-xl"
              >
                Start Quiz
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz completed screen
  if (quizCompleted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="text-center mb-6">
              <div className={cn(
                "w-32 h-32 rounded-full mx-auto flex items-center justify-center text-4xl font-bold mb-6",
                percentage >= 70 ? "bg-green-50 text-green-600" : 
                percentage >= 40 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
              )}>
                {score}/{quiz.questions.length}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
              <p className="text-gray-600 mb-6">
                You scored {score} out of {quiz.questions.length} questions correctly.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 text-sm mb-1">Time Taken</div>
                  <div className="font-bold text-gray-900">
                    {formatTime((quiz.timeLimit * 60) - (timeRemaining || 0))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 text-sm mb-1">Reveals Used</div>
                  <div className="font-bold text-gray-900">
                    {revealedAnswers.length}/{quiz.revealLimit}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.location.href = '/'}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.location.href = '/create'}
                >
                  <Brain className="w-4 h-4" />
                  Create Another Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // All questions on one page
  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6"
        >
          {/* Quiz Header - Redesigned */}
          <div className="bg-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-3">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium text-sm">Entertainment Trivia Quiz</span>
                </div>
                
                <h1 className="text-3xl font-bold mb-3">{quiz.title}</h1>
                
                <p className="text-white/80 text-sm mb-4">
                  Test your knowledge of {quiz.category} with this {quiz.difficulty} difficulty quiz.
                </p>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Questions</div>
                    <div className="text-lg font-bold">{quiz.questionCount}</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Time Elapsed</div>
                    <div className="text-lg font-bold">
                      {timeRemaining !== null && formatTime((quiz.timeLimit * 60) - timeRemaining)}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Difficulty</div>
                    <div className="text-lg font-bold capitalize">{quiz.difficulty}</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Reveals Left</div>
                    <div className="text-lg font-bold">{remainingReveals}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Content with Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Questions Column */}
            <div className="md:col-span-3 space-y-6">
              {quiz.questions.map((question, questionIndex) => {
                const isAnswerRevealed = revealedAnswers.includes(questionIndex);
                const selectedAnswer = selectedAnswers[questionIndex];
                
                return (
                  <motion.div 
                    key={questionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: questionIndex * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-semibold">
                          {questionIndex + 1}
                        </div>
                        <div className="ml-2 text-gray-500 text-sm">
                          {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-medium text-gray-900 mb-6">
                        {question.question}
                      </h2>
                      
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrectAnswer = option === question.correctAnswer;
                          
                          let optionClass = 'border-gray-200 hover:border-primary/50';
                          
                          if (isSelected) {
                            if (isAnswerRevealed) {
                              optionClass = isCorrectAnswer 
                                ? 'border-green-500 bg-green-50 text-green-700' 
                                : 'border-red-500 bg-red-50 text-red-700';
                            } else {
                              optionClass = 'border-primary bg-primary/5 text-primary';
                            }
                          } else if (isAnswerRevealed && isCorrectAnswer) {
                            optionClass = 'border-green-500 bg-green-50 text-green-700';
                          }
                          
                          return (
                            <button
                              key={optionIndex}
                              onClick={() => !isAnswerRevealed && handleAnswerSelect(questionIndex, option)}
                              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden ${optionClass}`}
                              disabled={isAnswerRevealed}
                            >
                              <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-600 font-medium flex-shrink-0">
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <div>{option}</div>
                              </div>
                              
                              {isSelected && (
                                <div className="absolute right-4 top-4">
                                  {isAnswerRevealed ? (
                                    isCorrectAnswer ? (
                                      <Check className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <X className="w-5 h-5 text-red-600" />
                                    )
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary/10"></div>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    {isAnswerRevealed && question.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
                      >
                        <div className="font-medium text-blue-900 mb-1">Explanation:</div>
                        <div className="text-blue-700">{question.explanation}</div>
                      </motion.div>
                    )}

                    {/* Reveal Answer Button */}
                    {canReveal && !isAnswerRevealed && (
                      <Button
                        variant="outline"
                        onClick={() => handleRevealAnswer(questionIndex)}
                        className="flex items-center gap-2 text-sm"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                        Reveal Answer
                      </Button>
                    )}
                  </motion.div>
                );
              })}
              
              {/* Submit Button */}
              <div className="sticky bottom-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                <Button
                  onClick={handleSubmitQuiz}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg rounded-xl"
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  Submit Quiz
                </Button>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <h3 className="font-medium mb-3">Progress</h3>
                <div className="mb-2 text-sm text-gray-500">
                  Questions Answered
                </div>
                <div className="text-2xl font-bold text-primary mb-2">
                  {questionsAnswered}/{quiz.questions.length}
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <h3 className="font-medium mb-3">Time</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {timeRemaining !== null && formatTime(timeRemaining)}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <h3 className="font-medium mb-3">Questions Overview</h3>
                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((_, index) => (
                    <div 
                      key={index}
                      className={`w-full aspect-square rounded flex items-center justify-center text-sm font-medium ${
                        selectedAnswers[index] 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 