"use client";

import { 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  BookOpen,
  Atom,
  Globe,
  BookText,
  Film,
  Trophy,
  Cpu,
  Utensils,
  Palette,
  Leaf
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, TrendingQuiz, Stats, Subcategory } from '@/types';

// Import data
import categoriesData from '@/data/categories.json';
import subcategoriesData from '@/data/subcategories.json';
import trendingData from '@/data/trending.json';
import statsData from '@/data/stats.json';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white py-20">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
      
      <div className="container relative flex flex-col items-center justify-center text-center">
        <div className="mb-8 animate-bounce">
          <Brain className="h-20 w-20 text-purple-600" />
        </div>
        
        <h1 className="mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
          Challenge Your Knowledge
        </h1>
        
        <p className="mb-10 max-w-2xl text-lg md:text-xl text-muted-foreground">
          Join millions of quiz enthusiasts and test your expertise across various categories
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/categories">
            <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
              Explore Categories
              <span className="text-lg">🎓</span>
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button size="lg" variant="outline" className="gap-2">
              View Leaderboard
              <span className="text-lg">🏆</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: Stats }) {
  return (
    <section className="bg-white py-16">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-600">{stats.activeUsers}</p>
            <p className="text-base md:text-lg text-muted-foreground">Active Users</p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-600">{stats.totalQuizzes}</p>
            <p className="text-base md:text-lg text-muted-foreground">Quizzes</p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-600">{stats.categories}</p>
            <p className="text-base md:text-lg text-muted-foreground">Categories</p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-600">{stats.userRating}</p>
            <p className="text-base md:text-lg text-muted-foreground">User Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendingSection({ trending }: { trending: TrendingQuiz[] }) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <h2 className="text-3xl font-bold">Trending Today</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">Most popular quizzes in the last 24 hours</p>
          <Link href="/trending" className="text-purple-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((quiz) => (
            <Link href={`/quiz/${quiz.id}`} key={quiz.id}>
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-48 w-full">
                  <Image
                    src={quiz.image}
                    alt={quiz.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                    <p className="text-sm text-white/80">{quiz.category}</p>
                  </div>
                </div>
                <CardFooter className="flex justify-between p-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{(quiz.participants / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.duration} min</span>
                  </div>
                  <Badge variant={quiz.difficulty === "Expert" ? "destructive" : quiz.difficulty === "Hard" ? "default" : "secondary"}>
                    {quiz.difficulty}
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({ categories, subcategories }: { categories: Category[], subcategories: Subcategory[] }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-6 w-6 text-purple-600" />;
      case "Atom":
        return <Atom className="h-6 w-6 text-purple-600" />;
      case "Globe":
        return <Globe className="h-6 w-6 text-purple-600" />;
      case "BookText":
        return <BookText className="h-6 w-6 text-purple-600" />;
      case "Film":
        return <Film className="h-6 w-6 text-purple-600" />;
      case "Trophy":
        return <Trophy className="h-6 w-6 text-purple-600" />;
      case "Cpu":
        return <Cpu className="h-6 w-6 text-purple-600" />;
      case "Utensils":
        return <Utensils className="h-6 w-6 text-purple-600" />;
      case "Palette":
        return <Palette className="h-6 w-6 text-purple-600" />;
      case "Leaf":
        return <Leaf className="h-6 w-6 text-purple-600" />;
      default:
        return <BookOpen className="h-6 w-6 text-purple-600" />;
    }
  };

  // Filter to only show featured categories
  const featuredCategories = categories.filter(category => category.featured);

  return (
    <section className="bg-white py-16">
      <div className="container">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Star className="h-6 w-6 text-purple-600" />
            <h2 className="text-3xl font-bold">Featured Categories</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">Explore our most popular quiz categories</p>
          <Link href="/categories" className="text-purple-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category) => {
            const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id);
            
            return (
              <Link href={`/${category.id}`} key={category.id}>
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      {getIcon(category.icon)}
                      <h3 className="text-xl font-bold">{category.name}</h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {categorySubcategories.slice(0, 2).map((subcategory) => (
                        <Badge key={subcategory.id} variant="outline" className="bg-purple-50">
                          {subcategory.name}
                        </Badge>
                      ))}
                      {categorySubcategories.length > 2 && (
                        <Badge variant="outline" className="bg-purple-50">
                          +{categorySubcategories.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-3">
                    <p className="text-sm text-muted-foreground">
                      {category.totalQuizzes} quizzes available
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const categories: Category[] = categoriesData.categories;
  const subcategories: Subcategory[] = subcategoriesData.subcategories;
  const trending: TrendingQuiz[] = trendingData.trending;
  const stats: Stats = statsData.stats;

  return (
    <>
      <HeroSection />
      <StatsSection stats={stats} />
      <TrendingSection trending={trending} />
      <CategoriesSection categories={categories} subcategories={subcategories} />
    </>
  );
}