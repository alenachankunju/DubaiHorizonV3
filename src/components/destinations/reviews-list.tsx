
"use client";

import type { Review } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import RatingDisplay from '@/components/shared/rating-display';
import { formatDistanceToNow } from 'date-fns';

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
}

export default function ReviewsList({ reviews, averageRating }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div>
        <h3 className="text-2xl font-headline mb-4">Reviews</h3>
        <p className="text-muted-foreground">No reviews yet for this destination. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <h3 className="text-2xl font-headline mb-2 sm:mb-0">Reviews ({reviews.length})</h3>
        <div className="flex items-center gap-2">
            <RatingDisplay rating={averageRating} />
            <span className="text-muted-foreground font-semibold">
                {averageRating.toFixed(1)} out of 5
            </span>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                    <p className="font-semibold">{review.user_name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                </div>
                <RatingDisplay rating={review.rating} size={16} />
              </div>
              {review.comment && (
                 <p className="text-sm text-foreground/90 mt-2 whitespace-pre-line">{review.comment}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
