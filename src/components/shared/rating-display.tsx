import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function RatingDisplay({
  rating,
  totalStars = 5,
  size = 16,
  className,
  showText = false,
}: RatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'transition-colors',
              starValue <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        );
      })}
      {showText && <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>}
    </div>
  );
}
