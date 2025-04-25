'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StudyTopic } from '@/types';

interface CategorySearchBarProps {
  allTopics: StudyTopic[];
  onSearch: (filteredTopicsBySubcategory: Record<string, StudyTopic[]>) => void;
  originalTopicsBySubcategory: Record<string, StudyTopic[]>;
}

export function CategorySearchBar({ 
  allTopics, 
  onSearch,
  originalTopicsBySubcategory
}: CategorySearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If search is empty, reset to original structure
      onSearch(originalTopicsBySubcategory);
      return;
    }
    
    // Filter topics based on search query
    const filteredTopics = allTopics.filter(topic =>
      topic.name.toLowerCase().includes(query.toLowerCase()) ||
      topic.description.toLowerCase().includes(query.toLowerCase()) ||
      topic.tags.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    // Reorganize filtered topics by subcategory
    const filteredBySubcategory: Record<string, StudyTopic[]> = {};
    
    filteredTopics.forEach(topic => {
      const subcategoryId = topic.subcategoryId;
      if (!filteredBySubcategory[subcategoryId]) {
        filteredBySubcategory[subcategoryId] = [];
      }
      filteredBySubcategory[subcategoryId].push(topic);
    });
    
    onSearch(filteredBySubcategory);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        type="text"
        placeholder={`Search ${allTopics.length} topics...`}
        className="pl-10 py-6 text-lg"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
} 