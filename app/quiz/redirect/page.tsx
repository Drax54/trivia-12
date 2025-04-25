"use client";

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Client component that uses useSearchParams
function RedirectContent() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get('id');
  const [message, setMessage] = useState("Preparing your quiz...");
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!quizId) {
      window.location.href = '/create';
      return;
    }

    // Verify localStorage contains the quiz data
    const verifyQuizData = () => {
      console.log("[DEBUG REDIRECT] Checking for quiz data with ID:", quizId);
      
      // Try different storage locations
      const idSpecificQuiz = localStorage.getItem(`quiz_${quizId}`);
      const genericQuiz = localStorage.getItem('generatedQuiz');
      const sessionQuiz = sessionStorage.getItem(`quiz_${quizId}`);
      
      if (idSpecificQuiz || genericQuiz || sessionQuiz) {
        console.log("[DEBUG REDIRECT] Quiz data found, redirecting to quiz page");
        
        // If we find the quiz in any storage location, synchronize it across all storage locations
        const quizData = idSpecificQuiz || genericQuiz || sessionQuiz;
        
        if (quizData) {
          if (!localStorage.getItem(`quiz_${quizId}`)) {
            localStorage.setItem(`quiz_${quizId}`, quizData);
          }
          if (!localStorage.getItem('generatedQuiz')) {
            localStorage.setItem('generatedQuiz', quizData);
          }
          if (!sessionStorage.getItem(`quiz_${quizId}`)) {
            sessionStorage.setItem(`quiz_${quizId}`, quizData);
          }
          
          // Once data is confirmed to be in localStorage, navigate to the quiz page
          setTimeout(() => {
            window.location.href = `/quiz/generated/${quizId}`;
          }, 500);
        }
      } else {
        // If quiz data isn't found yet, increase the counter and update the message
        console.log("[DEBUG REDIRECT] Quiz data not found yet, retrying...");
        setCounter(prev => prev + 1);
        
        if (counter < 3) {
          setMessage(`Looking for your quiz data... (${counter + 1}/5)`);
          
          // Retry after a short delay
          setTimeout(verifyQuizData, 300);
        } else if (counter < 8) {
          setMessage(`Still looking for your quiz... (${counter + 1}/10)`);
          
          // Retry after a longer delay
          setTimeout(verifyQuizData, 500);
        } else {
          // After several retries, offer a button to return to create page
          setMessage("We&apos;re having trouble finding your quiz. Please try again.");
          
          // After a timeout, redirect back to create page
          setTimeout(() => {
            window.location.href = '/create';
          }, 3000);
        }
      }
    };

    // Start the verification process
    verifyQuizData();
  }, [quizId, counter]);

  return (
    <div className="text-center px-4 max-w-sm mx-auto">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-primary"
        />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your Quiz is Ready!</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// Main page component that wraps client component with Suspense
export default function RedirectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main content that would normally be here */}
        <div className="h-32"></div>
        
        {/* Loading Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/90 via-white/90 to-blue-50/90 backdrop-blur-sm">
          <Suspense fallback={<p>Loading...</p>}>
            <RedirectContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 