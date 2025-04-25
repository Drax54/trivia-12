'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Category } from '@/types';

interface CategorySearchBarProps {
  categories: Category[];
  onSearch: (filteredCategories: Category[]) => void;
}

export function CategorySearchBar({ categories, onSearch }: CategorySearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If search is empty, reset to all categories
      onSearch(categories);
      return;
    }
    
    // Filter categories based on search query
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(query.toLowerCase()) ||
      category.description.toLowerCase().includes(query.toLowerCase()) ||
      category.popularTags?.some(tag => 
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
        placeholder={`Search across ${categories.length} categories...`}
        className="pl-10 pr-16 py-2.5 text-sm rounded-lg shadow-sm border-slate-200 focus-visible:ring-[hsl(251.16deg_84.31%_60%)] focus-visible:ring-offset-0 focus-visible:border-[hsl(251.16deg_84.31%_60%)/50%]"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchQuery && (
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-[hsl(251.16deg_84.31%_60%)] hover:text-[hsl(251.16deg_84.31%_50%)] transition-colors bg-purple-50 px-2 py-1 rounded"
          onClick={() => handleSearch('')}
        >
          Clear
        </button>
      )}
    </div>
  );
} 