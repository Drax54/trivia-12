'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StudyMainTopic } from '@/types';

interface SearchBarProps {
  topics: StudyMainTopic[];
  onSearch: (filteredTopics: StudyMainTopic[]) => void;
}

export function SearchBar({ topics, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter topics based on search query
    const filtered = topics.filter(topic =>
      topic.name.toLowerCase().includes(query.toLowerCase()) ||
      topic.description.toLowerCase().includes(query.toLowerCase()) ||
      topic.popularTags.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    onSearch(filtered);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search study materials..."
          className="pl-10 py-2 pr-4 rounded-md border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
} 