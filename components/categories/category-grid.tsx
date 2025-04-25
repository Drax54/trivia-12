"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Users, Trophy, Clock, BookOpen, Atom, Globe, BookText, Film, Cpu, Utensils, Palette, Leaf } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Category, Subcategory } from '@/types';

interface CategoryGridProps {
  categories: Category[];
  subcategories: Subcategory[];
}

// Icon mapping utility
const getIcon = (iconName: string) => {
  const iconProps = { className: "h-8 w-8 text-purple-600" };
  switch (iconName) {
    case "BookOpen": return <BookOpen {...iconProps} />;
    case "Atom": return <Atom {...iconProps} />;
    case "Globe": return <Globe {...iconProps} />;
    case "BookText": return <BookText {...iconProps} />;
    case "Film": return <Film {...iconProps} />;
    case "Cpu": return <Cpu {...iconProps} />;
    case "Utensils": return <Utensils {...iconProps} />;
    case "Palette": return <Palette {...iconProps} />;
    case "Leaf": return <Leaf {...iconProps} />;
    default: return <BookOpen {...iconProps} />;
  }
};

// Animation variants for cards
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
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

export function CategoryGrid({ categories, subcategories }: CategoryGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.popularTags?.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <section className="pb-24">
      <div className="container">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search categories..."
            className="pl-10 py-6 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredCategories.map((category) => {
            const categorySubcategories = subcategories.filter(
              sub => sub.categoryId === category.id
            );

            return (
              <motion.div key={category.id} variants={cardVariants}>
                <Link href={`/${category.id}`}>
                  <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm border-2 hover:border-purple-300">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                      <div className="absolute top-4 right-4">
                        {getIcon(category.icon)}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-muted-foreground">
                            {(category.totalAttempts / 1000).toFixed(1)}k attempts
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-muted-foreground">
                            {category.averageAccuracy}% avg. score
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {category.popularTags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-purple-50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 p-6 border-t">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-muted-foreground">
                            {category.ageGroup}
                          </span>
                        </div>
                        <Badge variant={
                          category.difficulty === "Expert" ? "destructive" : 
                          category.difficulty === "Hard" ? "default" : 
                          "secondary"
                        }>
                          {category.difficulty}
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No categories found matching your search.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}