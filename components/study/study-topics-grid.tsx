import { StudyTopic } from '@/types';
import { StudyTopicCard } from './study-topic-card';

interface StudyTopicsGridProps {
  topics: StudyTopic[];
}

export function StudyTopicsGrid({ topics }: StudyTopicsGridProps) {
  return (
    <div className="container pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <StudyTopicCard key={topic.id} topic={topic} />
        ))}
      </div>
      
      {topics.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No study topics available</h3>
          <p className="text-muted-foreground">
            Check back later for new study materials.
          </p>
        </div>
      )}
    </div>
  );
} 