import Image from 'next/image';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  Atom, 
  Globe, 
  BookText, 
  PieChart, 
  Cpu, 
  Palette, 
  Music 
} from 'lucide-react';
import { StudyMainTopic } from '@/types';

interface MainTopicCardProps {
  topic: StudyMainTopic;
}

export function MainTopicCard({ topic }: MainTopicCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full">
        <Image
          src={topic.image}
          alt={topic.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {topic.featured && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-purple-600">{renderIcon(topic.icon)}</span>
          {topic.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {topic.popularTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{topic.totalStudyMaterials} materials</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{topic.relatedQuizzes} quizzes</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link 
          href={`/study/${topic.id}`}
          className="w-full rounded-md bg-purple-600 hover:bg-purple-700 py-2 text-center font-medium text-white"
        >
          Explore
        </Link>
      </CardFooter>
    </Card>
  );
}

// Helper function to render the icon based on the icon name
function renderIcon(iconName: string) {
  const iconSize = { className: "h-5 w-5" };
  
  switch (iconName) {
    case 'BookOpen':
      return <BookOpen {...iconSize} />;
    case 'FileText':
      return <FileText {...iconSize} />;
    case 'Atom':
      return <Atom {...iconSize} />;
    case 'Globe':
      return <Globe {...iconSize} />;
    case 'BookText':
      return <BookText {...iconSize} />;
    case 'PieChart':
      return <PieChart {...iconSize} />;
    case 'Cpu':
      return <Cpu {...iconSize} />;
    case 'Palette':
      return <Palette {...iconSize} />;
    case 'Music':
      return <Music {...iconSize} />;
    default:
      return <BookOpen {...iconSize} />;
  }
} 