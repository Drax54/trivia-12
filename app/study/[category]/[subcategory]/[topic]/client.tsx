'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, BookOpen, ArrowLeft, ArrowRight, CheckCircle2, FileText, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { StudyMainTopic, StudySubcategory, StudyTopic, Quiz } from '@/types';

// Define content structure
interface TopicContent {
  introduction: string;
  sections: Array<{
    title: string;
    content: string;
    paragraphs?: string[];
    image?: string | {
      src: string;
      alt: string;
      caption: string;
    };
    imageCaption?: string;
    list?: {
      type: 'ordered' | 'unordered';
      items: string[];
    };
    quote?: {
      text: string;
      author?: string;
      context?: string;
    };
    table?: {
      caption?: string;
      headers: string[];
      rows: string[][];
    };
    tables?: {
      caption?: string;
      headers: string[];
      rows: string[][];
    };
  }>;
  conclusion: string;
}

interface StudyTopicClientProps {
  mainTopic: StudyMainTopic;
  subcategory: StudySubcategory;
  topic: StudyTopic;
  relatedTopics?: StudyTopic[];
  relatedQuizzes?: Quiz[];
  nextTopic?: StudyTopic;
  prevTopic?: StudyTopic;
}

export function StudyTopicClient({ 
  mainTopic, 
  subcategory, 
  topic,
  relatedTopics = [],
  relatedQuizzes = [],
  nextTopic,
  prevTopic
}: StudyTopicClientProps) {
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const toggleSectionCompletion = (sectionId: string) => {
    if (completedSections.includes(sectionId)) {
      setCompletedSections(prev => prev.filter(id => id !== sectionId));
    } else {
      setCompletedSections(prev => [...prev, sectionId]);
    }
  };
  
  // Get the quiz URL using the quiz's category and subcategory
  const getQuizUrl = (quiz: Quiz) => {
    // Convert category and subcategory names to URL-friendly format
    const categorySlug = quiz.category?.toLowerCase().replace(/\s+/g, '-') || quiz.categoryId;
    const subcategorySlug = quiz.subcategory?.toLowerCase().replace(/\s+/g, '-') || quiz.subcategoryId;
    return `/${categorySlug}/${subcategorySlug}/${quiz.id}`;
  };
  
  // Parse content to structured format or use default empty structure
  const parsedContent: TopicContent = 
    typeof topic.content === 'string' 
      ? { introduction: '', sections: [], conclusion: '' }
      : (topic.content as TopicContent) || { introduction: '', sections: [], conclusion: '' };
  
  return (
    <div className="min-h-screen bg-[#f9f5ff] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px]">
      {/* Breadcrumb Navigation - matching Entertainment page style */}
      <div className="container pt-5 pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/study" className="text-gray-500 hover:text-gray-700 transition-colors">Study</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/study/${mainTopic.id}`} className="text-gray-500 hover:text-gray-700 transition-colors">{mainTopic.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/study/${mainTopic.id}/${subcategory.id}`} className="text-gray-500 hover:text-gray-700 transition-colors">{subcategory.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-gray-500 font-medium">
                {topic.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section with grid background */}
      <div className="container py-8">
        {/* Topic Header - matching the design from the screenshot */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 text-indigo-600">
            {topic.name}
          </h1>
          <p className="text-lg text-gray-600 mb-5 max-w-3xl">
            {topic.description}
          </p>

          <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 mb-5">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{topic.readingTime} min read</span>
            </div>
            <Badge 
              className={
                topic.difficulty === 'Easy' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 border-none' 
                  : topic.difficulty === 'Medium' 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-none' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200 border-none'
              }
            >
              {topic.difficulty}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {topic.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-100">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with white background */}
      <div className="bg-white py-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-10 container">
          {/* Main Content */}
          <div className="flex-1">
            {/* Topic Content */}
            <div className="prose prose-slate max-w-none">
              {typeof topic.content === 'string' ? (
                // Render the full HTML content if it's a string
                <div dangerouslySetInnerHTML={{ __html: topic.content }} />
              ) : (
                // Otherwise render the structured content
                <>
                  {/* Introduction */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                    <div className="mb-4" dangerouslySetInnerHTML={{ __html: parsedContent.introduction }} />
                  </section>

                  <Separator className="my-8" />

                  {/* Main Content Sections */}
                  {parsedContent.sections.map((section, index) => (
                    <section key={index} className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <button 
                          onClick={() => toggleSectionCompletion(`section-${index}`)}
                          className="text-sm flex items-center gap-2 text-slate-500 hover:text-[hsl(251.16deg_84.31%_60%)]"
                        >
                          <CheckCircle2 className={`h-5 w-5 ${completedSections.includes(`section-${index}`) ? 'text-green-500 fill-green-500' : ''}`} />
                          {completedSections.includes(`section-${index}`) ? 'Completed' : 'Mark as completed'}
                        </button>
                      </div>
                      
                      <div className="text-slate-700">
                        {section.content ? (
                          <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        ) : section.paragraphs?.map ? (
                          section.paragraphs.map((paragraph, pIndex) => (
                            <p key={pIndex} className="mb-4">{paragraph}</p>
                          ))
                        ) : null}
                      </div>

                      {section.image && (
                        <figure className="my-6">
                          <div className="relative h-64 w-full rounded-lg overflow-hidden">
                            <Image 
                              src={typeof section.image === 'string' 
                                   ? section.image 
                                   : ((section.image as any).src || (section.image as any).url || "")} 
                              alt={typeof section.image === 'string' ? section.title : section.image.alt}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {typeof section.image === 'object' && section.image.caption ? (
                            <figcaption className="text-center text-gray-500 mt-2">{section.image.caption}</figcaption>
                          ) : section.imageCaption ? (
                            <figcaption className="text-center text-gray-500 mt-2">{section.imageCaption}</figcaption>
                          ) : null}
                        </figure>
                      )}

                      {section.list && (
                        <div className="my-6">
                          {section.list.type === 'ordered' ? (
                            <ol className="list-decimal pl-5 space-y-2">
                              {section.list.items.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ol>
                          ) : (
                            <ul className="list-disc pl-5 space-y-2">
                              {section.list.items.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {section.quote && (
                        <blockquote className="border-l-4 border-gray-300 pl-4 my-6 italic text-gray-600">
                          <p>{typeof section.quote === 'string' ? section.quote : section.quote.text}</p>
                          {typeof section.quote !== 'string' && section.quote.author && (
                            <footer className="text-right font-medium mt-2">
                              — {section.quote.author}
                              {section.quote.context && <span className="text-gray-500 text-sm block">{section.quote.context}</span>}
                            </footer>
                          )}
                        </blockquote>
                      )}

                      {(section.table || section.tables) && (
                        <div className="my-6 overflow-x-auto">
                          {/* Use either table or tables based on which one exists */}
                          {(section.table?.caption || section.tables?.caption) && (
                            <p className="text-center font-medium mb-2">
                              {section.table?.caption || section.tables?.caption}
                            </p>
                          )}
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {(section.table?.headers || section.tables?.headers)?.map((header, headerIndex) => (
                                  <th 
                                    key={headerIndex}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {(section.table?.rows || section.tables?.rows)?.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  ))}

                  <Separator className="my-8" />

                  {/* Conclusion */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
                    <div className="mb-4" dangerouslySetInnerHTML={{ __html: parsedContent.conclusion }} />
                  </section>
                </>
              )}

              {/* Navigation Between Topics */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t">
                {prevTopic ? (
                  <Link 
                    href={`/study/${mainTopic.id}/${subcategory.id}/${prevTopic.id}`}
                    className="flex items-center gap-2 text-[hsl(251.16deg_84.31%_60%)] hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous: {prevTopic.name}</span>
                  </Link>
                ) : (
                  <div></div>
                )}

                {nextTopic && (
                  <Link 
                    href={`/study/${mainTopic.id}/${subcategory.id}/${nextTopic.id}`}
                    className="flex items-center gap-2 text-[hsl(251.16deg_84.31%_60%)] hover:underline"
                  >
                    <span>Next: {nextTopic.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-4 space-y-8">
              {/* Test Your Knowledge */}
              <Card className="border rounded-lg overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Test Your Knowledge</h3>
                  <p className="text-slate-600 mb-4">
                    Ready to test your understanding of {topic.name}?
                  </p>
                  {relatedQuizzes && relatedQuizzes.length > 0 ? (
                    <Link href={getQuizUrl(relatedQuizzes[0])}>
                      <Button className="w-full bg-[hsl(251.16deg_84.31%_60%)] hover:bg-[hsl(251.16deg_84.31%_50%)]">
                        Take Quiz
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full bg-slate-300 text-slate-600 cursor-not-allowed">
                      No Quizzes Available
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Related Quizzes Section */}
              {relatedQuizzes && relatedQuizzes.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Related Quizzes</h3>
                    <div className="space-y-4">
                      {relatedQuizzes.map((quiz) => (
                        <Link 
                          key={quiz.id} 
                          href={getQuizUrl(quiz)}
                          className="block"
                        >
                          <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <h4 className="font-medium mb-1 hover:text-[hsl(251.16deg_84.31%_60%)]">
                              {quiz.title}
                            </h4>
                            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                              <div className="flex items-center">
                                <FileText className="mr-1 h-3 w-3" />
                                <span>{quiz.questionCount} questions</span>
                              </div>
                              <div className="flex items-center">
                                <Timer className="mr-1 h-3 w-3" />
                                <span>{quiz.timeLimit} min</span>
                              </div>
                            </div>
                            <Badge variant={
                              quiz.difficulty === 'Easy' ? 'secondary' : 
                              quiz.difficulty === 'Medium' ? 'outline' : 
                              'destructive'
                            } className="text-xs">
                              {quiz.difficulty}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Related Topics - Only show if there are any */}
              {relatedTopics && relatedTopics.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Related Topics</h3>
                    <div className="space-y-4">
                      {relatedTopics.slice(0, 5).map((relatedTopic) => (
                        <Link 
                          key={relatedTopic.id}
                          href={`/study/${mainTopic.id}/${subcategory.id}/${relatedTopic.id}`}
                          className="block"
                        >
                          <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <h4 className="font-medium mb-1 hover:text-[hsl(251.16deg_84.31%_60%)]">
                              {relatedTopic.name}
                            </h4>
                            <div className="flex items-center text-xs text-slate-500">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>{relatedTopic.readingTime} min read</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Topic Tags - Only show if there are tags */}
              {topic.tags && topic.tags.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Topic Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-slate-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 