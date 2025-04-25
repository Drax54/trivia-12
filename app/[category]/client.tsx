"use client";

import { useState, useEffect } from 'react';
import { Search, ChevronRight, Home, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Category, Subcategory, Quiz } from '@/types';
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
    x: -20
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4
    }
  }
};

// Function to get appropriate gradient and icon for each subcategory
const getSubcategoryStyle = (name: string) => {
  // Default values
  let gradient = "from-indigo-600 to-purple-700";
  let iconComponent = (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <path d="M12 3a6 6 0 0 0-6 6c0 7 6 12 6 12s6-5 6-12a6 6 0 0 0-6-6z"></path>
      <circle cx="12" cy="9" r="2"></circle>
    </svg>
  );
  
  // Determine gradient and icon based on subcategory name
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("movie") || nameLower === "movies") {
    gradient = "from-indigo-600 to-purple-700";
    iconComponent = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="16" cy="8" r="1" />
        <circle cx="8" cy="16" r="1" />
        <circle cx="16" cy="16" r="1" />
        <path d="M2 12h20" />
        <path d="M12 2v20" />
      </svg>
    );
  } else if (nameLower.includes("music") || nameLower === "music") {
    gradient = "from-blue-600 to-cyan-600";
    iconComponent = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  } else if (nameLower.includes("tv") || nameLower.includes("show") || nameLower.includes("television")) {
    gradient = "from-green-600 to-teal-600";
    iconComponent = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    );
  } else if (nameLower.includes("sport") || nameLower.includes("athletic")) {
    gradient = "from-orange-500 to-red-500";
    iconComponent = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <circle cx="12" cy="12" r="10" />
        <path d="M5.5 5.5 18 18" />
        <path d="M18.5 5.5 6 18" />
      </svg>
    );
  } else if (nameLower.includes("game") || nameLower.includes("video")) {
    gradient = "from-violet-600 to-fuchsia-600";
    iconComponent = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 12h.01" />
        <path d="M7 12h.01" />
        <path d="M17 12h.01" />
      </svg>
    );
  } else if (nameLower.includes("book") || nameLower.includes("literature") || nameLower.includes("fiction")) {
    gradient = "from-amber-600 to-yellow-500";
    iconComponent = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  
  return { gradient, iconComponent };
};

interface CategoryClientProps {
  category: Category;
  subcategories: Subcategory[];
  quizzes: Quiz[];
  quizzesWithQuestions: any[]; // Add questions data
}

interface SubcategoryQuizzes {
  [key: string]: {
    quizzes: Quiz[];
    visibleCount: number;
    expanded: boolean;
  };
}

export default function CategoryClient({ category, subcategories, quizzes, quizzesWithQuestions }: CategoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [subcategoryQuizzes, setSubcategoryQuizzes] = useState<SubcategoryQuizzes>(() => {
    const initial: SubcategoryQuizzes = {};
    subcategories.forEach(sub => {
      initial[sub.id] = {
        quizzes: quizzes.filter(quiz => 
          // Check both subcategory and subcategoryId
          quiz.subcategory === sub.name || quiz.subcategoryId === sub.id
        ),
        visibleCount: 5,
        expanded: false
      };
    });
    return initial;
  });

  // Generate alphabet array
  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  // Create a map of quiz IDs to their titles from questions.json
  const quizTitlesMap = quizzesWithQuestions.reduce((acc, quiz) => {
    acc[quiz.id] = quiz.title;
    return acc;
  }, {} as {[key: string]: string});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter subcategories based on search and selected letter
  const filteredSubcategories = subcategories
    .filter(subcategory => {
      // Filter by selected letter
      const matchesLetter = selectedLetter ? 
        subcategory.name.toUpperCase().startsWith(selectedLetter) : true;
      
      // If no search query, just filter by letter
      if (!debouncedSearchQuery) return matchesLetter;

      const lowerQuery = debouncedSearchQuery.toLowerCase().trim();
      
      // Check if subcategory matches search
      const subcategoryMatches = subcategory.name.toLowerCase().includes(lowerQuery) ||
        subcategory.description.toLowerCase().includes(lowerQuery);
      
      // Check if any quiz in this subcategory matches search
      const subcategoryQuizzesData = subcategoryQuizzes[subcategory.id]?.quizzes || [];
      const quizMatches = subcategoryQuizzesData.some(quiz => {
        // Check quiz title - using the same approach as above
        const titleWords = quiz.title.toLowerCase().split(/\s+/);
        const titleExactMatch = titleWords.some(word => word.includes(lowerQuery));
        const titleContainsMatch = quiz.title.toLowerCase().includes(lowerQuery);
        
        // Check quiz description
        const descMatches = quiz.description.toLowerCase().includes(lowerQuery);
        
        // Check quiz title from questions.json
        const questionsTitleMatches = quizTitlesMap[quiz.id] ? 
          quizTitlesMap[quiz.id].toLowerCase().includes(lowerQuery) : false;
        
        // Check quiz tags
        const tagMatches = quiz.tags ? 
          quiz.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) : false;
        
        return titleExactMatch || titleContainsMatch || descMatches || questionsTitleMatches || tagMatches;
      });
      
      return matchesLetter && (subcategoryMatches || quizMatches);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleQuizzes = (subcategoryId: string) => {
    setSubcategoryQuizzes(prev => {
      const currentState = prev[subcategoryId];
      const quizzes = currentState.quizzes;
      
      // Filter quizzes that match the search query
      const filteredQuizzes = !debouncedSearchQuery ? quizzes : 
        quizzes.filter(quiz => {
          const lowerQuery = debouncedSearchQuery.toLowerCase().trim();
          
          // Check quiz title - using the same approach as above
          const titleWords = quiz.title.toLowerCase().split(/\s+/);
          const titleExactMatch = titleWords.some(word => word.includes(lowerQuery));
          const titleContainsMatch = quiz.title.toLowerCase().includes(lowerQuery);
          
          // Check quiz description
          const descMatches = quiz.description.toLowerCase().includes(lowerQuery);
          
          // Check quiz title from questions.json
          const questionsTitleMatches = quizTitlesMap[quiz.id] ? 
            quizTitlesMap[quiz.id].toLowerCase().includes(lowerQuery) : false;
          
          // Check quiz tags
          const tagMatches = quiz.tags ? 
            quiz.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) : false;
          
          return titleExactMatch || titleContainsMatch || descMatches || questionsTitleMatches || tagMatches;
        });
      
      const totalFilteredQuizzes = filteredQuizzes.length;
      
      // If expanded, collapse to initial 5, otherwise add 5 more quizzes
      const newVisibleCount = currentState.expanded ? 5 : Math.min(currentState.visibleCount + 5, totalFilteredQuizzes);
      
      // Only toggle expanded state if we're showing all quizzes or collapsing
      const newExpandedState = newVisibleCount >= totalFilteredQuizzes ? true : false;
      
      return {
        ...prev,
        [subcategoryId]: {
          ...currentState,
          visibleCount: newVisibleCount,
          expanded: newExpandedState
        }
      };
    });
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
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Hero Section with Category Info */}
      <div className="relative py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="container relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            {category.name}
          </h1>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {category.description}
          </p>

          {/* Search Section */}
          <div className="container mb-16">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold">All Quizzes ({quizzes.length})</h2>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, topic, or category..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLetter(null)} className={!selectedLetter ? 'bg-indigo-50 text-indigo-600' : ''}>
                  All
                </Button>
              </div>
            </div>
          </div>

          {/* Alphabet Filter */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-8">
            <Button
              variant={selectedLetter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLetter(null)}
              className="py-2 px-4 h-auto text-sm font-medium"
            >
              All
            </Button>
            {alphabet.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLetter(letter)}
                className={`py-2 px-3.5 h-auto text-sm font-medium ${
                  subcategories.some(sub => sub.name.toUpperCase().startsWith(letter))
                    ? ""
                    : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!subcategories.some(sub => sub.name.toUpperCase().startsWith(letter))}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategories with Quizzes - Two Column Layout */}
      <div className="container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubcategories.map((subcategory, index) => {
            const subcategoryData = subcategoryQuizzes[subcategory.id];
            const allQuizzes = subcategoryData.quizzes;
            
            // Filter quizzes that match the search query
            const filteredQuizzes = !debouncedSearchQuery ? allQuizzes : 
              allQuizzes.filter(quiz => {
                const lowerQuery = debouncedSearchQuery.toLowerCase().trim();
                
                // Check quiz title - using the same approach as above
                const titleWords = quiz.title.toLowerCase().split(/\s+/);
                const titleExactMatch = titleWords.some(word => word.includes(lowerQuery));
                const titleContainsMatch = quiz.title.toLowerCase().includes(lowerQuery);
                
                // Check quiz description
                const descMatches = quiz.description.toLowerCase().includes(lowerQuery);
                
                // Check quiz title from questions.json
                const questionsTitleMatches = quizTitlesMap[quiz.id] ? 
                  quizTitlesMap[quiz.id].toLowerCase().includes(lowerQuery) : false;
                
                // Check quiz tags
                const tagMatches = quiz.tags ? 
                  quiz.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) : false;
                
                return titleExactMatch || titleContainsMatch || descMatches || questionsTitleMatches || tagMatches;
              });
            
            // Take only the visible number of quizzes from the filtered list
            const visibleQuizzes = filteredQuizzes.slice(0, subcategoryData.visibleCount);
            // Use the actual filtered quizzes length for total count when searching
            const totalQuizzes = debouncedSearchQuery ? filteredQuizzes.length : subcategoryData.quizzes.length;

            // Get the appropriate style for this subcategory
            const { gradient, iconComponent } = getSubcategoryStyle(subcategory.name);

            return (
              <motion.div 
                key={subcategory.id} 
                variants={itemVariants} 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Clean modern subcategory card */}
                <div className={`bg-gradient-to-r ${gradient} rounded-xl overflow-hidden shadow-md mb-8`}>
                  <div className="p-6 relative">
                    {/* Subcategory icon in the background */}
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-10 scale-150">
                      {iconComponent}
                    </div>
                    
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-3 rounded-lg shadow-md flex-shrink-0">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={subcategory.image}
                            alt={subcategory.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{subcategory.name}</h2>
                        <p className="text-base text-white/90 my-1">
                          Test your knowledge of {subcategory.description.toLowerCase()}
                        </p>
                      </div>
                      <Badge className="bg-white text-indigo-700 uppercase py-1.5 px-3 font-medium">
                        {subcategory.difficulty || "MEDIUM"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quiz list header */}
                <div className="flex justify-between items-center mb-6 px-1">
                  <h3 className="text-sm font-medium text-slate-500 uppercase">
                    Quizzes ({totalQuizzes})
                  </h3>
                  <Link 
                    href={`/${category.id}/${subcategory.id}`} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 font-medium text-sm flex items-center shadow-sm"
                  >
                    View All ({totalQuizzes})
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </div>

                {/* Quiz list in a clean layout */}
                <div className="space-y-3 mb-4">
                  {visibleQuizzes.map((quiz) => (
                    <Link 
                      key={quiz.id}
                      href={`/${category.id}/${subcategory.id}/${quiz.id}`} 
                      className="block"
                    >
                      <div className="bg-white border border-slate-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors duration-150 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${
                              quiz.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' :
                              quiz.difficulty === 'Medium' ? 'bg-indigo-100 text-indigo-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              <Clock className="h-4 w-4" />
                            </div>
                            <h4 className="font-medium text-slate-800">{quiz.title}</h4>
                          </div>
                          <Badge className={`${
                            quiz.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                            quiz.difficulty === 'Medium' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 justify-between">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{quiz.timeLimit} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{quiz.attempts.toLocaleString()} attempts</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View More/Less Button */}
                {filteredQuizzes.length > 0 && (
                  <>
                    {/* Show View More when there are more quizzes to load */}
                    {filteredQuizzes.length > visibleQuizzes.length && (
                      <div className="text-center mt-6 mb-4">
                        <Button
                          onClick={() => toggleQuizzes(subcategory.id)}
                          variant="outline"
                          size="sm"
                          className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium text-sm py-2 px-5 h-auto flex mx-auto items-center shadow-sm"
                        >
                          View More ({filteredQuizzes.length - visibleQuizzes.length})
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Show View Less only when all quizzes are loaded and there are more than 5 */}
                    {filteredQuizzes.length === visibleQuizzes.length && filteredQuizzes.length > 5 && (
                      <div className="text-center mt-6 mb-4">
                        <Button
                          onClick={() => toggleQuizzes(subcategory.id)}
                          variant="outline"
                          size="sm"
                          className="border-slate-300 text-slate-600 hover:bg-slate-100 font-medium text-sm py-2 px-5 h-auto"
                        >
                          View Less
                        </Button>
                      </div>
                    )}
                  </>
                )}
                
                {/* Show message when no matching quizzes in subcategory */}
                {debouncedSearchQuery && filteredQuizzes.length === 0 && (
                  <div className="text-center py-3 text-base text-gray-500">
                    No matching quizzes in this subcategory
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSubcategories.length === 0 && (
          <div className="text-center py-16 col-span-2">
            <p className="text-2xl text-muted-foreground mb-3">
              No subcategories found matching your search.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearchQuery('');
                setSelectedLetter(null);
              }}
              className="mt-4 text-base py-2 px-6"
            >
              Reset Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}