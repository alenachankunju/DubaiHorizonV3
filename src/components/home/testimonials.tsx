
"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RatingDisplay from '@/components/shared/rating-display';
import { supabase } from '@/lib/supabaseClient';
import type { Review } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';


export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('reviews')
                .select('*, featured_destinations(name)') // Join to get destination name
                .eq('rating', 5) // Fetch only 5-star reviews
                .order('created_at', { ascending: false })
                .limit(3);

            if (fetchError) throw fetchError;
            
            setReviews(data || []);
        } catch (err: any) {
            console.error("Error fetching testimonials:", err);
            setError(err.message || "Failed to load testimonials.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchTestimonials();
  }, []);


  if (isLoading) {
    return <TestimonialsSkeleton />;
  }

  if (error) {
     return (
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-semibold text-center mb-10">What Our Travelers Say</h2>
            <Alert variant="destructive" className="max-w-xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Testimonials</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline font-semibold text-center mb-10">What Our Travelers Say</h2>
          <p className="text-center text-muted-foreground">Be the first to leave a 5-star review!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10">What Our Travelers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review: Review) => {
             const initials = review.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
             const destinationName = review.featured_destinations?.name || 'a destination';

            return (
              <Card key={review.id} className="p-6 shadow-md border-t-4 border-primary flex flex-col">
                <CardContent className="p-0 flex flex-col flex-grow">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-14 w-14 mr-4">
                      <AvatarImage src="" alt={review.user_name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{review.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Reviewed <Link href={`/destinations/${review.destination_id}`} className="text-primary hover:underline">{destinationName}</Link>
                      </p>
                    </div>
                  </div>
                  <RatingDisplay rating={review.rating} className="mb-4" />
                  <blockquote className="text-foreground/80 italic border-l-2 border-primary/50 pl-4 flex-grow">
                    "{review.comment || 'An amazing experience!'}"
                  </blockquote>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}


function TestimonialsSkeleton() {
    return (
        <section className="py-12 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-headline font-semibold text-center mb-10">What Our Travelers Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, index) => (
                        <Card key={index} className="p-6 shadow-md border-t-4 border-primary flex flex-col">
                            <CardContent className="p-0 flex flex-col flex-grow space-y-4">
                                <div className="flex items-center">
                                    <Skeleton className="h-14 w-14 mr-4 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                 <Skeleton className="h-5 w-28" />
                                <div className="space-y-2 flex-grow">
                                     <Skeleton className="h-4 w-full" />
                                     <Skeleton className="h-4 w-5/6" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
