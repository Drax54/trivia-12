'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/study/search-bar';
import { MainTopicsGrid } from '@/components/study/main-topics-grid';
import { BookOpen, HomeIcon } from 'lucide-react';
import { StudyMainTopic } from '@/types';

interface StudyPageClientProps {
  mainTopics: StudyMainTopic[];
}

export function StudyPageClient({ mainTopics }: StudyPageClientProps) {
  const [filteredTopics, setFilteredTopics] = useState<StudyMainTopic[]>(mainTopics);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Breadcrumbs */}
      <div className="container py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Home</span>
          </Link>
          <span className="mx-1">&gt;</span>
          <span className="text-foreground font-medium flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>Study</span>
          </span>
        </nav>
      </div>

      {/* Header Section with Search */}
      <div className="relative py-8 md:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="container relative">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Study Materials
          </h1>
          <p className="text-center text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Enhance your knowledge with our comprehensive study materials. Prepare for quizzes with in-depth content on various topics.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-4">
            <SearchBar topics={mainTopics} onSearch={setFilteredTopics} />
          </div>
        </div>
      </div>

      {/* Main Study Topics Grid */}
      <MainTopicsGrid topics={filteredTopics} />
    </div>
  );
} 