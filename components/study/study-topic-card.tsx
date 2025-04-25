import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen } from 'lucide-react';
import { StudyTopic } from '@/types';

interface StudyTopicCardProps {
  topic: StudyTopic;
}

export function StudyTopicCard({ topic }: StudyTopicCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image
          src={topic.image}
          alt={topic.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{topic.name}</CardTitle>
        <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {topic.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{topic.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{topic.difficulty}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full rounded-md bg-primary py-2 text-center font-medium text-primary-foreground hover:bg-primary/90">
          Read Study Material
        </div>
      </CardFooter>
    </Card>
  );
} 