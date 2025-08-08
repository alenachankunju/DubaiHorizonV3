
"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  totalStars?: number;
  size?: number;
  className?: string;
}

export default function StarRatingInput({
  rating,
  onRatingChange,
  totalStars = 5,
  size = 24,
  className,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              size={size}
              className={cn(
                'transition-colors cursor-pointer',
                starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
