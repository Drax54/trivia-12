'use client';

import { useState, useMemo } from 'react';
import { StudyTopicCard } from '@/components/study/study-topic-card';
import { Separator } from '@/components/ui/separator';
import { StudyMainTopic, StudySubcategory, StudyTopic } from '@/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronUp, BookText, Clock, FileText, Globe, Palette, Atom } from 'lucide-react';
import Image from 'next/image';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { CategorySearchBar } from '@/components/study/category-search-bar';

interface StudyCategoryClientProps {
  mainTopic: StudyMainTopic;
  subcategories: StudySubcategory[];
  topicsBySubcategory: Record<string, StudyTopic[]>;
}

// Helper function to get icon based on name or position
const getSubcategoryIcon = (subcategory: StudySubcategory, index: number) => {
  const iconClass = "h-6 w-6";
  
  switch (index % 5) {
    case 0: return <BookText className={iconClass} />;
    case 1: return <Globe className={iconClass} />;
    case 2: return <FileText className={iconClass} />;
    case 3: return <Palette className={iconClass} />;
    case 4: return <Atom className={iconClass} />;
    default: return <BookOpen className={iconClass} />;
  }
};

// Get a color based on index
const getIconColor = (index: number) => {
  const colors = ['emerald', 'blue', 'purple', 'orange', 'pink'];
  return colors[index % colors.length];
};

// Get background color based on index
const getIconBgColor = (index: number) => {
  const colors = ['emerald', 'blue', 'purple', 'orange', 'pink'];
  const color = colors[index % colors.length];
  return `bg-${color}-100`;
};

export function StudyCategoryClient({ 
  mainTopic, 
  subcategories, 
  topicsBySubcategory 
}: StudyCategoryClientProps) {
  // Maintain original topics for search reset
  const originalTopicsBySubcategory = useMemo(() => topicsBySubcategory, [topicsBySubcategory]);
  
  // Extract all topics for search functionality
  const allTopics = useMemo(() => {
    return Object.values(topicsBySubcategory).flat();
  }, [topicsBySubcategory]);
  
  const [filteredTopicsBySubcategory, setFilteredTopicsBySubcategory] = useState(topicsBySubcategory);
  
  // Track visible topics count for each subcategory
  const [visibleTopicsCounts, setVisibleTopicsCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    subcategories.forEach(subcategory => {
      initial[subcategory.id] = 3; // Initially show 3 topics
    });
    return initial;
  });
  
  // Toggle expand/collapse for a subcategory
  const toggleExpand = (subcategoryId: string) => {
    const topics = filteredTopicsBySubcategory[subcategoryId] || [];
    const currentVisibleCount = visibleTopicsCounts[subcategoryId] || 3;
    
    setVisibleTopicsCounts(prev => {
      // If showing all topics or more than initial, reset to 3
      if (currentVisibleCount >= topics.length) {
        return { ...prev, [subcategoryId]: 3 };
      } 
      
      // Otherwise add 5 more topics (or show all if less than 5 remaining)
      const newCount = Math.min(currentVisibleCount + 5, topics.length);
      return { ...prev, [subcategoryId]: newCount };
    });
  };

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
              <BreadcrumbLink className="text-gray-500 font-medium">
                {mainTopic.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section - matching Entertainment page style */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-3 text-indigo-600">{mainTopic.name}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore topics and materials related to {mainTopic.name}
        </p>
        
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
              placeholder={`Search ${mainTopic.name} topics, subcategories...`}
              onChange={(e) => {
                if (!e.target.value) {
                  // Reset to original data when search is cleared
                  setFilteredTopicsBySubcategory(originalTopicsBySubcategory);
                  return;
                }
                
                const searchTerm = e.target.value.toLowerCase();
                
                // Filter topics that match the search term
                const matchingTopics = allTopics.filter(topic => 
                  topic.name.toLowerCase().includes(searchTerm) || 
                  topic.description.toLowerCase().includes(searchTerm) ||
                  (topic.tags && topic.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
                
                // Group matching topics by subcategory
                const filtered: Record<string, StudyTopic[]> = {};
                
                // For each subcategory, include only the matching topics
                Object.keys(originalTopicsBySubcategory).forEach(subcategoryId => {
                  const topicsInSubcategory = matchingTopics.filter(topic => 
                    originalTopicsBySubcategory[subcategoryId].some(t => t.id === topic.id)
                  );
                  
                  if (topicsInSubcategory.length > 0) {
                    filtered[subcategoryId] = topicsInSubcategory;
                  }
                });
                
                setFilteredTopicsBySubcategory(filtered);
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container py-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Topics</h3>
        {/* Two-column grid of subtopics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTopics.map((topic) => {
            // Find which subcategory this topic belongs to
            const subcategoryId = Object.keys(topicsBySubcategory).find(
              (key) => topicsBySubcategory[key].some((t) => t.id === topic.id)
            ) || '';
            const subcategory = subcategories.find((s) => s.id === subcategoryId);
            
            return (
              <Link 
                key={topic.id}
                href={`/study/${mainTopic.id}/${subcategoryId}/${topic.id}`}
                className="block"
              >
                <div className="bg-white border border-gray-200 rounded-lg hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-full ${
                        topic.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                        topic.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="font-medium text-gray-800 truncate">{topic.name}</div>
                    </div>
                    <Badge className={`ml-2 ${
                      topic.difficulty === 'Easy' ? 'bg-green-100 text-green-800 border-green-200' :
                      topic.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {topic.difficulty}
                    </Badge>
                  </div>
                  {subcategory && (
                    <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>{topic.readingTime} min read</span>
                      <div className="w-1 h-1 rounded-full bg-gray-300 mx-2"></div>
                      <span className="truncate">{subcategory.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 