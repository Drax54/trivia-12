import type { Metadata } from 'next';
import studyMainTopicsData from '@/data/study-main-topics.json';
import { StudyPageClient } from './client';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Study Materials | Trivia Master',
  description: 'Enhance your knowledge with our comprehensive study materials. From history to science, prepare for quizzes with in-depth content on various topics.',
  keywords: 'study materials, quiz preparation, learning resources, educational content, trivia study',
  alternates: {
    canonical: 'http://localhost:3000/study/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// Static page generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function StudyPage() {
  const { mainTopics } = studyMainTopicsData;

  return (
    <StudyPageClient mainTopics={mainTopics} />
  );
} 