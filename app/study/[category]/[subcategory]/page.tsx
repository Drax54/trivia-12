import type { Metadata } from 'next';

// Simple static metadata
export const metadata: Metadata = {
  title: 'Study Subcategory',
  description: 'Study subcategory page',
};

// Basic page component
export default function StudySubcategoryPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Study Subcategory Page</h1>
      <p className="text-gray-600">This page is under construction</p>
    </div>
  );
} 