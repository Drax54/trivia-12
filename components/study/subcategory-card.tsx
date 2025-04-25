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
import { BookOpen } from 'lucide-react';
import { StudySubcategory } from '@/types';

interface SubcategoryCardProps {
  subcategory: StudySubcategory;
  mainTopicId: string;
}

export function SubcategoryCard({ subcategory, mainTopicId }: SubcategoryCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full">
        <Image
          src={subcategory.image}
          alt={subcategory.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{subcategory.name}</CardTitle>
        <CardDescription className="line-clamp-2">{subcategory.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {subcategory.popularTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{subcategory.totalStudyMaterials} study materials</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link 
          href={`/study/${mainTopicId}/${subcategory.id}`}
          className="w-full rounded-md bg-primary py-2 text-center font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse Topics
        </Link>
      </CardFooter>
    </Card>
  );
} 