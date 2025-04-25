'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, BookOpen, ChevronRight, Tag, Info, ThumbsUp, Download, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { SubcategorySearchBar } from '@/components/study/subcategory-search-bar';
import { StudyMainTopic, StudySubcategory, StudyTopic } from '@/types';

interface StudySubcategoryClientProps {
  mainTopic: StudyMainTopic;
  subcategory: StudySubcategory;
  topics: StudyTopic[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    }
  }
};

export function StudySubcategoryClient({ 
  mainTopic, 
  subcategory, 
  topics 
}: StudySubcategoryClientProps) {
  const [filteredTopics, setFilteredTopics] = useState<StudyTopic[]>(topics);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const applyFilters = (searchResults: StudyTopic[]) => {
    if (!selectedDifficulty) {
      setFilteredTopics(searchResults);
      return;
    }
    
    const filtered = searchResults.filter(topic => 
      topic.difficulty === selectedDifficulty
    );
    
    setFilteredTopics(filtered);
  };

  const handleSearch = (searchResults: StudyTopic[]) => {
    applyFilters(searchResults);
  };

  const handleDifficultyChange = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
    
    if (!difficulty) {
      setFilteredTopics(topics);
      return;
    }
    
    const filtered = topics.filter(topic => 
      topic.difficulty === difficulty
    );
    
    setFilteredTopics(filtered);
  };

  const totalReadingTime = filteredTopics.reduce((acc, topic) => acc + topic.readingTime, 0);

  return (
    <div className="min-h-screen bg-[#f9f5ff] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px]">
      {/* Breadcrumb navigation - matching Entertainment page style */}
      <div className="container pt-5 pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/study" className="text-gray-500 hover:text-gray-700 transition-colors">Study</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/study/${mainTopic.id}`} className="text-gray-500 hover:text-gray-700 transition-colors">{mainTopic.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-gray-500 font-medium">
                {subcategory.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section - matching Entertainment page style */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-3 text-indigo-600">{subcategory.name}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subcategory.description}</p>
        
        {/* Search bar - matching Entertainment page style */}
        <div className="max-w-2xl mx-auto mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search"
              className="w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={`Search ${subcategory.name} topics, materials...`}
              onChange={(e) => {
                const results = topics.filter(topic => 
                  topic.name.toLowerCase().includes(e.target.value.toLowerCase()) || 
                  topic.description.toLowerCase().includes(e.target.value.toLowerCase()) ||
                  topic.tags.some(tag => tag.toLowerCase().includes(e.target.value.toLowerCase()))
                );
                setFilteredTopics(e.target.value ? results : topics);
              }}
            />
          </div>
        </div>
      </div>

      <div className="container mb-16">
        {/* Filter Bar - Simplified */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Filter by Difficulty</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDifficultyChange(null)}
                variant={!selectedDifficulty ? "default" : "outline"}
                size="sm"
                className={!selectedDifficulty ? "bg-indigo-600 hover:bg-indigo-700" : ""}
              >
                All
              </Button>
              <Button 
                onClick={() => handleDifficultyChange('Easy')}
                variant={selectedDifficulty === 'Easy' ? "default" : "outline"}
                size="sm"
                className={selectedDifficulty === 'Easy' ? "bg-green-600 hover:bg-green-700" : "border-green-200 text-green-700 hover:bg-green-50"}
              >
                Easy
              </Button>
              <Button 
                onClick={() => handleDifficultyChange('Medium')}
                variant={selectedDifficulty === 'Medium' ? "default" : "outline"}
                size="sm"
                className={selectedDifficulty === 'Medium' ? "bg-amber-600 hover:bg-amber-700" : "border-amber-200 text-amber-700 hover:bg-amber-50"}
              >
                Medium
              </Button>
              <Button 
                onClick={() => handleDifficultyChange('Hard')}
                variant={selectedDifficulty === 'Hard' ? "default" : "outline"}
                size="sm"
                className={selectedDifficulty === 'Hard' ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-700 hover:bg-red-50"}
              >
                Hard
              </Button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Study Topics
            <Badge className="bg-indigo-600 hover:bg-indigo-700 ml-2 py-1">
              {filteredTopics.length}/{topics.length}
            </Badge>
          </h2>
        </div>

        {/* Topics Cards with improved design */}
        {filteredTopics.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            {filteredTopics.map((topic, index) => (
              <motion.div key={topic.id} variants={itemVariants}>
                <Link 
                  href={`/study/${mainTopic.id}/${subcategory.id}/${topic.id}`}
                  className="group block h-full"
                >
                  <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-indigo-50/40">
                    <div className="absolute top-0 right-0 p-3">
                      <Badge 
                        variant="outline" 
                        className={
                          topic.difficulty === 'Easy' 
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : topic.difficulty === 'Medium'
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-red-100 border-red-300 text-red-800'
                        }
                      >
                        {topic.difficulty}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2 pt-6">
                      <CardTitle className="text-xl text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {topic.name}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {topic.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {topic.tags.slice(0, 3).map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs bg-indigo-50 border-indigo-100 text-indigo-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-gray-50 border-gray-100 text-gray-700"
                          >
                            +{topic.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2 pb-4 flex justify-between text-sm border-t border-indigo-100 mt-2">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span>{topic.readingTime} min read</span>
                      </div>
                      <div className="text-indigo-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        <span>Read more</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-xl shadow-sm bg-white">
            <div className="bg-indigo-100 p-3 rounded-full mb-3">
              <Info className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-xl font-medium mb-2 text-gray-800">No topics found</p>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              We couldn&apos;t find any study materials matching your current filters. Try adjusting your search query or difficulty filter.
            </p>
            <Button 
              onClick={() => {
                setFilteredTopics(topics);
                setSelectedDifficulty(null);
              }} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              View all topics
            </Button>
          </div>
        )}
      </div>
      
      {/* Tips & Resources Section */}
      {topics.length > 0 && (
        <div className="bg-[#f9f5ff] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] py-12 border-t border-indigo-100">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Study Tips & Resources</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Make the most of your learning experience with these helpful resources</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-600" />
                    Downloadable Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Download study guides and practice materials to enhance your learning experience offline.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-indigo-600" />
                    Practice Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Test your knowledge with our related quizzes after studying each topic to reinforce your learning.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-600" />
                    Share Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Share your study progress with friends or on social media to stay motivated and accountable.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 