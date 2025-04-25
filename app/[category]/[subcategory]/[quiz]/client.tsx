"use client";

import { useState, useEffect } from 'react';
import { 
  Share2, 
  Eye, 
  Clock, 
  Users, 
  Target, 
  Brain, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link2, 
  Printer, 
  Download, 
  Check, 
  X,
  Home,
  ChevronRight,
  FileText,
  FileCheck,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { jsPDF } from 'jspdf';
import { Category, Subcategory, Quiz } from '@/types';
import Image from 'next/image';

// Helper function to format date
const formatDate = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// PDF generation functions
const generateQuestionsPDF = (quiz: Quiz, questions: any[], title?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header with logo and title
  doc.setFontSize(24);
  doc.setTextColor(89, 73, 232);
  doc.text("Trivia Master", margin, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text(formatDate(), margin, yPos);

  yPos += 20;
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(`${title || quiz.title} - Trivia Questions and Answers`, margin, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Total Questions: ${questions.length}`, margin, yPos);
  yPos += 7;
  doc.text(`Time Limit: ${quiz.timeLimit} minutes`, margin, yPos);
  yPos += 7;
  doc.text(`Difficulty: ${quiz.difficulty}`, margin, yPos);

  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(89, 73, 232);
  doc.text("Questions", margin, yPos);
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  questions.forEach((question, index) => {
    if (yPos > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${question.text}`, margin, yPos, {
      maxWidth: pageWidth - (margin * 2)
    });

    yPos += 10;
    question.options.forEach((option: string, optionIndex: number) => {
      if (yPos > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${String.fromCharCode(65 + optionIndex)}) ${option}`, margin + 5, yPos);
      yPos += 7;
    });
    yPos += 5;
  });

  doc.save(`${title || quiz.title}-Trivia-Questions.pdf`);
};

const generateAnswersPDF = (quiz: Quiz, questions: any[], title?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header with logo and title
  doc.setFontSize(24);
  doc.setTextColor(89, 73, 232);
  doc.text("Trivia Master", margin, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text(formatDate(), margin, yPos);

  yPos += 20;
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(`${title || quiz.title} - Answer Key`, margin, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Total Questions: ${questions.length}`, margin, yPos);
  yPos += 7;
  doc.text(`Time Limit: ${quiz.timeLimit} minutes`, margin, yPos);
  yPos += 7;
  doc.text(`Difficulty: ${quiz.difficulty}`, margin, yPos);

  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(89, 73, 232);
  doc.text("Questions & Answers", margin, yPos);
  
  yPos += 10;

  questions.forEach((question, index) => {
    if (yPos > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    // Question
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${question.text}`, margin, yPos, {
      maxWidth: pageWidth - (margin * 2)
    });

    yPos += 10;

    // Correct Answer
    doc.setTextColor(46, 125, 50);
    doc.text(`Correct Answer: ${question.correctAnswer}`, margin + 5, yPos);
    
    yPos += 7;

    // Explanation
    if (question.explanation) {
      doc.setTextColor(128, 128, 128);
      doc.text(`Explanation: ${question.explanation}`, margin + 5, yPos, {
        maxWidth: pageWidth - (margin * 2) - 5
      });
      yPos += doc.getTextDimensions(question.explanation, {
        maxWidth: pageWidth - (margin * 2) - 5
      }).h + 10;
    } else {
      yPos += 10;
    }
  });

  doc.save(`${title || quiz.title}-Trivia-Questions-and-Answers-Answers.pdf`);
};

// Define study-related types
interface StudyMainTopic {
  id: string;
  name: string;
  description: string;
  metaDescription: string;
  icon: string;
  image: string;
  totalStudyMaterials: number;
  relatedQuizzes: number;
  popularTags: string[];
  featured: boolean;
}

interface StudySubcategory {
  id: string;
  mainTopicId: string;
  name: string;
  description: string;
  metaDescription: string;
  image: string;
  totalStudyMaterials: number;
  popularTags: string[];
}

interface StudyTopic {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  description: string;
  metaDescription: string;
  image: string;
  content: any; // Using any for flexibility since content can be string or object
  difficulty: string;
  readingTime: number;
  relatedQuizIds: string[];
  relatedTopicIds: string[];
  tags: string[];
  lastUpdated: string;
  [key: string]: any; // Allow for additional properties
}

interface QuizClientProps {
  category: Category;
  subcategory: Subcategory;
  quiz: Quiz;
  questions: any[];
  quizTitle?: string;
  relatedStudyTopic?: StudyTopic | null;
  studyMainTopic?: StudyMainTopic | null;
  studySubcategory?: StudySubcategory | null;
}

export default function QuizClient({ 
  category, 
  subcategory, 
  quiz, 
  questions,
  quizTitle,
  relatedStudyTopic,
  studyMainTopic,
  studySubcategory
}: QuizClientProps) {
  // Debug logs
  console.log("Quiz client rendering with:", {
    categoryId: category?.id,
    subcategoryId: subcategory?.id,
    quizId: quiz?.id,
    quizTitle,
    questionsCount: questions?.length,
  });

  const [currentScore, setCurrentScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [toast, setToast] = useState<{message: string, visible: boolean}>({message: '', visible: false});
  const [revealAttemptsLeft, setRevealAttemptsLeft] = useState(5);

  const totalQuestions = questions.length;
  const progressPercentage = (Object.keys(answers).length / totalQuestions) * 100;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    let toastTimer: NodeJS.Timeout;
    if (toast.visible) {
      toastTimer = setTimeout(() => {
        setToast(prev => ({...prev, visible: false}));
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [toast.visible]);

  const showToast = (message: string) => {
    setToast({message, visible: true});
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const title = quiz.title;
    const description = quiz.description || `Test your knowledge about ${title}`;
    const url = window.location.href;
    
    // Create a more detailed share text with contextual information
    const shareText = quizCompleted 
      ? `I scored ${currentScore}% on the "${title}" quiz on Trivia Master! This quiz tests your knowledge about ${category.name}. Try to beat my score!` 
      : `Check out this "${title}" quiz on Trivia Master! Test your knowledge about ${category.name} with ${questions.length} challenging questions.`;
    
    // Show feedback to the user
    showToast(`Sharing to ${platform}...`);
    
    // Helper function to open share windows with consistent parameters
    const openShareWindow = (shareUrl: string, name: string, width = 600, height = 450) => {
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        shareUrl,
        name,
        `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,scrollbars=0,status=0`
      );
    };
    
    switch (platform) {
      case 'facebook':
        // Try native Web Share API first if available (works better on mobile)
        if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          navigator.share({
            title: title,
            text: shareText,
            url: url
          })
          .then(() => showToast('Shared successfully!'))
          .catch((err) => {
            console.error('Share error:', err);
            // Fall back to Facebook share dialog if Web Share API fails
            // Use the most reliable format for Facebook sharing
            const facebookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(shareText)}`;
            openShareWindow(facebookUrl, 'facebook-share-dialog', 550, 450);
          });
        } else {
          // Use Facebook share dialog on desktop with both URL and text parameters
          // Facebook prefers the u and t parameters
          const facebookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(shareText)}`;
          openShareWindow(facebookUrl, 'facebook-share-dialog', 550, 450);
        }
        break;
      
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=TriviaQuiz,${category.name.replace(/\s+/g, '')}`;
        openShareWindow(twitterUrl, 'twitter-share-dialog');
        break;
      
      case 'linkedin':
        // Include title, summary, source and URL parameters for LinkedIn
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(shareText)}&source=TriviaMaster`;
        openShareWindow(linkedinUrl, 'linkedin-share-dialog', 600, 600);
        break;
    }
  };

  const downloadResults = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(89, 73, 232);
    doc.text("Trivia Master", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${quizTitle || quiz.title} - Quiz Results`, 20, 40);
    
    doc.setDrawColor(89, 73, 232);
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(20, 50, 170, 40, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.text(`Final Score: ${currentScore}%`, 30, 65);
    doc.text(`Time taken: ${formatTime(timeElapsed)}`, 30, 75);
    doc.text(`Questions answered: ${Object.keys(answers).length}/${totalQuestions}`, 30, 85);
    
    // Add questions and answers
    let yPosition = 105;
    
    doc.setFontSize(16);
    doc.setTextColor(89, 73, 232);
    doc.text("Questions and Your Answers", 20, yPosition);
    yPosition += 10;
    
    questions.forEach((question, index) => {
      // Check if need to add a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Question ${index + 1}: ${question.text}`, 20, yPosition);
      yPosition += 10;
      
      // User's answer
      const userAnswer = answers[index] || "Not answered";
      doc.setTextColor(0, 0, 0);
      doc.text(`Your answer: ${userAnswer}`, 25, yPosition);
      yPosition += 7;
      
      // Correct answer
      doc.setTextColor(userAnswer === question.correctAnswer ? 0 : 255, userAnswer === question.correctAnswer ? 128 : 0, userAnswer === question.correctAnswer ? 0 : 0);
      doc.text(`Correct answer: ${question.correctAnswer}`, 25, yPosition);
      yPosition += 7;
      
      if (question.explanation) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        
        // Split explanation into multiple lines if too long
        const explanation = doc.splitTextToSize(`Explanation: ${question.explanation}`, 160);
        doc.text(explanation, 25, yPosition);
        yPosition += (explanation.length * 6);
      }
      
      // Add some spacing between questions
      yPosition += 10;
    });
    
    doc.save(`${quizTitle || quiz.title}-Trivia-Questions-and-Answers-Results.pdf`);
  };

  const handleAnswerSelect = (questionIndex: number, option: string) => {
    const newAnswers = { ...answers, [questionIndex]: option };
    setAnswers(newAnswers);

    const correctAnswers = Object.entries(newAnswers).reduce((count, [index, answer]) => {
      return count + (answer === questions[parseInt(index)].correctAnswer ? 1 : 0);
    }, 0);

    const newScore = Math.round((correctAnswers / Object.keys(newAnswers).length) * 100);
    setCurrentScore(newScore);
    setAnsweredQuestions(Object.keys(newAnswers).length);
  };

  const handleShowResults = () => {
    setQuizCompleted(true);
    setShowResultsDialog(true);
    setTimerActive(false);
  };

  const handleRevealAnswer = (questionIndex: number) => {
    if (revealAttemptsLeft > 0) {
      setShowAnswer(prev => ({ ...prev, [questionIndex]: true }));
      setRevealAttemptsLeft(prev => prev - 1);
    }
  };

  const getOptionClassName = (questionIndex: number, option: string) => {
    if (!quizCompleted) {
      return `p-4 rounded-lg border text-left transition-all ${
        answers[questionIndex] === option 
          ? 'border-purple-600 bg-purple-50' 
          : 'hover:border-purple-300'
      }`;
    }

    const isSelected = answers[questionIndex] === option;
    const isCorrect = option === questions[questionIndex].correctAnswer;

    if (isSelected && isCorrect) {
      return "p-4 rounded-lg border border-green-500 bg-green-50 text-green-700";
    } else if (isSelected && !isCorrect) {
      return "p-4 rounded-lg border border-red-500 bg-red-50 text-red-700";
    } else if (!isSelected && isCorrect) {
      return "p-4 rounded-lg border border-green-500 bg-green-50/50 text-green-700";
    }

    return "p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container py-8 px-4 lg:px-8">
        {/* Toast notification */}
        {toast.visible && (
          <div className="fixed top-4 right-4 bg-primary text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-300 transform translate-y-0 opacity-100">
            {toast.message}
          </div>
        )}

        {/* Navigation breadcrumb */}
        <nav className="flex items-center space-x-2 mb-8 text-sm bg-white/50 p-3 rounded-xl backdrop-blur-sm">
          <Link href="/" className="text-gray-500 hover:text-primary transition-colors flex items-center">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href="/categories" className="text-gray-500 hover:text-primary transition-colors">Categories</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href={`/${category.id}`} className="text-gray-500 hover:text-primary transition-colors">{category.name}</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href={`/${category.id}/${subcategory.id}`} className="text-gray-500 hover:text-primary transition-colors">
            {subcategory.name}
          </Link>
        </nav>

        {/* Hero section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 to-primary mb-8">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex-1 flex flex-col h-full justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm mb-4">
                    <Brain className="w-4 h-4" />
                    <span>{category.name} Quiz</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                    {quizTitle || quiz.title}
                  </h1>
                  <p className="text-base text-white/90 max-w-2xl mb-6">{quiz.description}</p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-indigo-500/90 to-blue-600/90 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg shadow-indigo-500/10">
                    <div className="text-white/90 text-xs font-medium mb-0.5">Questions</div>
                    <div className="text-xl font-bold text-white">{questions.length}</div>
                  </div>
                  <div className="bg-gradient-to-br from-fuchsia-500/90 to-purple-600/90 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg shadow-purple-500/10">
                    <div className="text-white/90 text-xs font-medium mb-0.5">Time Elapsed</div>
                    <div className="text-xl font-bold text-white">{formatTime(timeElapsed)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg shadow-orange-500/10">
                    <div className="text-white/90 text-xs font-medium mb-0.5">Difficulty</div>
                    <div className="text-xl font-bold text-white capitalize">{quiz.difficulty}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg shadow-emerald-500/10">
                    <div className="text-white/90 text-xs font-medium mb-0.5">Reveals Left</div>
                    <div className="text-xl font-bold text-white">{revealAttemptsLeft}</div>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-[400px] aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
                <Image 
                  src={quiz.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2069&auto=format&fit=crop"}
                  alt={quizTitle || quiz.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Questions Section */}
          <div className="space-y-6">
            {/* Quiz Content Section */}
            {questions.map((question, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">{index + 1}</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {question.difficulty}
                      </Badge>
                    </div>
                    {!quizCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevealAnswer(index)}
                        className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={revealAttemptsLeft === 0 || showAnswer[index]}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showAnswer[index] ? "Answer Revealed" : "Reveal Answer"}
                        {!showAnswer[index] && revealAttemptsLeft > 0 && (
                          <span className="ml-1">({revealAttemptsLeft})</span>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-medium text-gray-900">{question.text}</h2>

                    {(showAnswer[index] || (quizCompleted && answers[index] !== question.correctAnswer)) && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="font-medium">Correct Answer: <span className="text-primary">{question.correctAnswer}</span></p>
                        <p className="text-gray-600 mt-2">{question.explanation}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {question.options.map((option: string, optionIndex: number) => (
                        <button
                          key={optionIndex}
                          onClick={() => !quizCompleted && handleAnswerSelect(index, option)}
                          disabled={quizCompleted}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                            getOptionClassName(index, option)
                          } hover:shadow-md disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                            </div>
                            <span className="flex-grow text-left">{option}</span>
                            {quizCompleted && (
                              <div className="flex-shrink-0">
                                {option === question.correctAnswer ? (
                                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-green-600" />
                                  </div>
                                ) : answers[index] === option ? (
                                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                    <X className="h-4 w-4 text-red-600" />
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center py-8">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-12 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={Object.keys(answers).length < questions.length || quizCompleted}
                onClick={handleShowResults}
              >
                Complete Quiz
              </Button>
            </div>

            {/* Quiz Content Section */}
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: quiz.quizContent || '<article><h2 class="text-2xl font-bold mb-4">Additional Resources</h2><p class="text-gray-700 leading-relaxed">Content for this quiz is currently being prepared. Check back soon for detailed explanations and study materials.</p></article>' 
                }} 
              />
            </div>
          </div>

          {/* Floating Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/40">
                <div className="space-y-8">
                  <div>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full py-6 flex flex-col items-center justify-center border-2 border-primary rounded-xl bg-primary/5"
                      disabled
                    >
                      <Eye className="h-6 w-6 text-primary mb-2" />
                      <span className="text-lg font-bold text-primary">{revealAttemptsLeft} Reveals Left</span>
                    </Button>
                  </div>

                  <div className="pt-2">
                    <h3 className="font-semibold mb-4 text-gray-900">Progress</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Questions Answered</span>
                      <span className="text-sm font-medium text-primary">{Object.keys(answers).length}/{questions.length}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2.5" />
                  </div>

                  <div className="pt-2">
                    <h3 className="font-semibold mb-3 text-gray-900">Time</h3>
                    <div className="text-3xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                  </div>

                  {relatedStudyTopic && studyMainTopic && studySubcategory && (
                    <div className="pt-2">
                      <h3 className="font-semibold mb-4 text-gray-900">Study Materials</h3>
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-sm text-gray-600 mb-3">
                          Want to learn more about {relatedStudyTopic.name}?
                        </p>
                        <Link
                          href={`/study/${studyMainTopic.id}/${studySubcategory.id}/${relatedStudyTopic.id}`}
                          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Study Topic
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <h3 className="font-semibold mb-4 text-gray-900">Questions Overview</h3>
                    <div className="grid grid-cols-5 gap-2.5">
                      {questions.map((_, index) => (
                        <div
                          key={index}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                            quizCompleted
                              ? answers[index] === questions[index].correctAnswer
                                ? "bg-green-100 text-green-700"
                                : answers[index]
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                              : answers[index]
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Quiz Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{currentScore}%</div>
                    <div className="text-sm text-gray-600 mt-1">Final Score</div>
                  </div>
                </div>
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    className="stroke-current text-primary/10"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    className="stroke-current text-primary"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${currentScore * 4.64} 464`}
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">Correct Answers</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(answers).filter((answer, index) => answer === questions[index].correctAnswer).length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 text-sm font-medium">Incorrect Answers</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(answers).filter((answer, index) => answer !== questions[index].correctAnswer).length}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600 text-sm font-medium">Time Taken</span>
              </div>
              <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
            </div>

            <div className="space-y-3">
              <Button onClick={downloadResults} className="w-full gap-2 py-6 text-lg rounded-xl">
                <Download className="h-5 w-5" />
                Download Results PDF
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('twitter')}
                  className="w-full py-6 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('facebook')}
                  className="w-full py-6 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-400"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('linkedin')}
                  className="w-full py-6 hover:bg-blue-700 hover:text-white hover:border-blue-700"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}