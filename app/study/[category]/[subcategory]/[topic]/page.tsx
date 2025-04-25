import { Metadata } from 'next';

// Simple static metadata
export const metadata: Metadata = {
  title: 'Study Topic',
  description: 'Study topic page',
};

// Basic page component
export default function StudyTopicPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Study Topic Page</h1>
      <p className="text-gray-600">This page is under construction</p>
    </div>
  );
} 