// This wrapper provides the generateStaticParams required by Next.js with "output: export"
// The actual quiz functionality is in the client component

// This is required for Next.js static site generation
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

// Dynamically import the client component to avoid "use client" + generateStaticParams conflict
import dynamic from 'next/dynamic';
const GeneratedQuizClient = dynamic(() => import('./client'), { ssr: false });

export default function GeneratedQuizPage(props: { params: { id: string } }) {
  return <GeneratedQuizClient {...props} />;
} 