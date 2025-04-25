'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StudyTopic } from '@/types';

interface SubcategorySearchBarProps {
  topics: StudyTopic[];
  onSearch: (filteredTopics: StudyTopic[]) => void;
}

export function SubcategorySearchBar({ topics, onSearch }: SubcategorySearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If search is empty, reset to all topics
      onSearch(topics);
      return;
    }
    
    // Filter topics based on search query
    const filtered = topics.filter(topic =>
      topic.name.toLowerCase().includes(query.toLowerCase()) ||
      topic.description.toLowerCase().includes(query.toLowerCase()) ||
      topic.tags.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    onSearch(filtered);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(251.16deg_84.31%_60%)] h-4 w-4" />
      <Input
        type="text"
        placeholder={`Search ${topics.length} topics...`}
        className="pl-9 py-2 text-sm rounded-full border-slate-200 focus-visible:ring-[hsl(251.16deg_84.31%_60%)] focus-visible:ring-offset-0 focus-visible:border-[hsl(251.16deg_84.31%_60%)/50%]"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchQuery && (
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[hsl(251.16deg_84.31%_60%)] hover:text-[hsl(251.16deg_84.31%_50%)] transition-colors"
          onClick={() => handleSearch('')}
        >
          Clear
        </button>
      )}
    </div>
  );
} 