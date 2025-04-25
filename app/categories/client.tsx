'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, BookOpen, Cpu, Globe, BookText, Trophy, LightbulbIcon } from 'lucide-react';
import { Category } from '@/types';
import { CategorySearchBar } from '@/components/categories/category-search-bar';

interface CategoriesClientProps {
  categories: Category[];
}

// Icon mapping utility
const getIcon = (iconName: string) => {
  const iconProps = { className: "w-8 h-8 text-white" };
  switch (iconName) {
    case "BookOpen": return <BookOpen {...iconProps} />;
    case "Globe": return <Globe {...iconProps} />;
    case "BookText": return <BookText {...iconProps} />;
    case "Film": return <Film {...iconProps} />;
    case "Cpu": return <Cpu {...iconProps} />;
    case "Trophy": return <Trophy {...iconProps} />;
    default: return <LightbulbIcon {...iconProps} />;
  }
};

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);

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
            <span>Categories</span>
          </span>
        </nav>
      </div>

      {/* Header Section with Search */}
      <div className="relative py-8 md:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="container relative">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Quiz Categories
          </h1>
          <p className="text-center text-base text-muted-foreground max-w-2xl mx-auto mb-4">
            Explore our diverse collection of quiz categories. Each category offers unique
            challenges to test your knowledge and help you learn something new.
          </p>
          
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-lg font-semibold text-purple-600">
              {categories.reduce((acc, cat) => acc + (cat.totalQuizzes || 0), 0)} total quizzes available
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-4">
            <CategorySearchBar categories={categories} onSearch={setFilteredCategories} />
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link 
              href={`/${category.id}`} 
              key={category.id}
              className="block rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-[hsl(251.16deg_84.31%_60%)] h-full flex flex-col">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    {getIcon(category.icon)}
                  </div>
                  <div className="text-white text-sm font-medium">
                    {category.totalQuizzes || 0} quizzes
                  </div>
                </div>
                <div className="px-4 pb-4 mt-2">
                  <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  <p className="text-sm text-white/80 mt-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-slate-50">
            <p className="text-lg font-medium mb-2">No categories found</p>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search query to find what you&apos;re looking for.
            </p>
            <button 
              onClick={() => setFilteredCategories(categories)} 
              className="px-4 py-2 rounded-md border border-[hsl(251.16deg_84.31%_60%)] text-[hsl(251.16deg_84.31%_60%)] hover:bg-[hsl(251.16deg_84.31%_60%)/10] transition-colors"
            >
              View all categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 