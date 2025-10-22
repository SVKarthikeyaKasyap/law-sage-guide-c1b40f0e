import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackButtonsProps {
  messageId?: string;
  onFeedback?: (rating: 1 | -1) => void;
}

export const FeedbackButtons = ({ messageId, onFeedback }: FeedbackButtonsProps) => {
  const [rating, setRating] = useState<1 | -1 | null>(null);

  const handleFeedback = (value: 1 | -1) => {
    setRating(value);
    onFeedback?.(value);
  };

  return (
    <div className="flex gap-1 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(1)}
        className={cn(
          "h-7 px-2",
          rating === 1 && "bg-accent text-accent-foreground"
        )}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(-1)}
        className={cn(
          "h-7 px-2",
          rating === -1 && "bg-accent text-accent-foreground"
        )}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
};