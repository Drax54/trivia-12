import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trivia Master - Test Your Knowledge with Fun Quizzes',
  description: 'Challenge yourself with thousands of quizzes across various topics. Learn, compete, and track your progress.',
  icons: {
    icon: '/logo.svg',
  },
  alternates: {
    canonical: 'http://localhost:3000/'
  },
  openGraph: {
    title: 'Trivia Master - Test Your Knowledge with Fun Quizzes',
    description: 'Challenge yourself with thousands of quizzes across various topics. Learn, compete, and track your progress.',
    type: 'website',
    url: 'http://localhost:3000/',
    siteName: 'Trivia Master',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}