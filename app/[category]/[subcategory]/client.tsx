"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Home, Clock, Users, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Quiz, Category, Subcategory } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

interface SubcategoryClientProps {
  category: Category;
  subcategory: Subcategory;
  quizzes: Quiz[];
  quizzesWithQuestions: any[]; // Add questions data
}

export default function SubcategoryClient({ category, subcategory, quizzes, quizzesWithQuestions }: SubcategoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleQuizzes, setVisibleQuizzes] = useState(50);

  // Create a map of quiz IDs to their titles from questions.json
  const quizTitlesMap = quizzesWithQuestions.reduce((acc, quiz) => {
    acc[quiz.id] = quiz.title;
    return acc;
  }, {} as {[key: string]: string});

  // Filter quizzes based on search
  const filteredQuizzes = quizzes.filter(quiz => {
    if (!searchQuery) return true;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    // Check quiz name from quizzes.json
    const nameMatches = quiz.title.toLowerCase().includes(lowerQuery);
    
    // Check quiz description
    const descMatches = quiz.description.toLowerCase().includes(lowerQuery);
    
    // Check quiz title from questions.json
    const titleMatches = quizTitlesMap[quiz.id] ? 
      quizTitlesMap[quiz.id].toLowerCase().includes(lowerQuery) : false;
    
    // Check quiz tags
    const tagMatches = quiz.tags ? 
      quiz.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) : false;
    
    return nameMatches || descMatches || titleMatches || tagMatches;
  });

  const loadMore = () => {
    setVisibleQuizzes(prev => Math.min(prev + 50, filteredQuizzes.length));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Breadcrumbs */}
      <div className="container py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground flex items-center">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/${category.id}`} className="hover:text-foreground">
            {category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{subcategory.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="container relative">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative h-48 w-48 rounded-xl overflow-hidden shadow-xl">
              <Image
                src={subcategory.image}
                alt={subcategory.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{subcategory.name}</h1>
              <p className="text-xl text-muted-foreground mb-6">{subcategory.description}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Badge variant={subcategory.difficulty === "Expert" ? "destructive" : 
                        subcategory.difficulty === "Hard" ? "default" : 
                        "secondary"}>
                  {subcategory.difficulty}
                </Badge>
                <Badge variant="outline">{subcategory.ageGroup}</Badge>
                <Badge variant="outline">{subcategory.totalQuizzes} Quizzes</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container pb-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <h2 className="text-2xl font-bold">Quizzes ({filteredQuizzes.length})</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search quizzes by name, title, or tags..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link 
              href={`/${category.id}/${subcategory.id}`} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 font-medium text-sm flex items-center shadow-sm whitespace-nowrap"
            >
              View All ({filteredQuizzes.length})
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </div>
        </div>

        {/* Quizzes List */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredQuizzes.slice(0, visibleQuizzes).map((quiz) => (
            <motion.div key={quiz.id} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 h-full">
                <div className="p-6">
                  <div className="flex flex-col h-full">
                    {/* Top: Icon, Title, Description */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="rounded-full bg-purple-100 p-3 flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                        <p className="text-muted-foreground">{quiz.description}</p>
                      </div>
                    </div>

                    {/* Middle: Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-auto mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{quiz.attempts.toLocaleString()} attempts</span>
                      </div>
                    </div>

                    {/* Bottom: Button and Labels */}
                    <div className="flex flex-wrap justify-between items-center mt-auto">
                      <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                        <Badge variant={quiz.difficulty === "Hard" ? "default" : 
                                quiz.difficulty === "Medium" ? "secondary" : 
                                "destructive"}>
                          {quiz.difficulty}
                        </Badge>
                        {quiz.tags?.slice(0, 1).map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-purple-50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Link href={`/${category.id}/${subcategory.id}/${quiz.id}`}>
                        <Button className="gap-2">
                          Start Quiz
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        {visibleQuizzes < filteredQuizzes.length && (
          <div className="text-center mt-12">
            <Button 
              onClick={loadMore} 
              variant="outline" 
              size="lg"
              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-6"
            >
              Load More Quizzes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No quizzes found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}