
"use client";

import { useState, useEffect } from 'react';
import DestinationCard from '@/components/shared/destination-card';
import SearchFilter from '@/components/shared/search-filter';
import type { Destination } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";


export default function DestinationsPage() {
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllDestinations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Workaround: Fetch destinations and reviews separately
        const { data: destinationsData, error: destinationsError } = await supabase
            .from('featured_destinations')
            .select('*')
            .order('created_at', { ascending: false });

        if (destinationsError) throw destinationsError;
        
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('destination_id, rating');

        if (reviewsError) throw reviewsError;
        
        const reviewsByDestination = (reviewsData || []).reduce((acc, review) => {
            if (!acc[review.destination_id]) {
                acc[review.destination_id] = [];
            }
            acc[review.destination_id].push(review.rating);
            return acc;
        }, {} as Record<string, number[]>);


        const typedData = (destinationsData || []).map(d => {
            const destReviews = reviewsByDestination[d.id] || [];
            const averageRating = destReviews.length > 0 ? destReviews.reduce((a, b) => a + b, 0) / destReviews.length : 0;
            return {
                ...d,
                shortDescription: d.short_description,
                main_image_url: d.main_image_url,
                gallery_image_urls: d.gallery_image_urls || [],
                location_address: d.location_address,
                type: d.types || [],
                features: d.features || [],
                tags: d.tags || [],
                rating: averageRating,
                review_count: destReviews.length,
            } as Destination
        });

        setAllDestinations(typedData);
        setFilteredDestinations(typedData);
      } catch (err: any) {
        console.error("Error fetching all destinations (raw):", err.message || err);
        let errorMessage = "Failed to load destinations.";
        if (err.message?.includes('structure of query does not match function result type')) {
          errorMessage = "Database function mismatch. Please check the 'get_destinations_with_ratings' function in your Supabase SQL editor to ensure its return types match the 'featured_destinations' table."
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllDestinations();
  }, []);

  const handleFilterChange = (newFiltered: Destination[]) => {
    setFilteredDestinations(newFiltered);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">Explore Dubai</h1>
      
      <SearchFilter destinations={allDestinations} onFilterChange={handleFilterChange} />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
         <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Destinations</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredDestinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}

      {!isLoading && !error && filteredDestinations.length === 0 && allDestinations.length > 0 && (
         <p className="text-center text-muted-foreground text-lg py-10">
          No destinations match your current filters. Try adjusting your search!
        </p>
      )}
      
      {!isLoading && !error && allDestinations.length === 0 && (
         <p className="text-center text-muted-foreground text-lg py-10">
          No destinations have been added yet. Check back soon or add some in the admin panel!
        </p>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow animate-pulse">
      <Skeleton className="h-48 w-full rounded-md bg-muted" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4 bg-muted" />
        <Skeleton className="h-4 w-1/2 bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-1/3 bg-muted" />
        <Skeleton className="h-8 w-1/4 bg-muted" />
      </div>
    </div>
  )
}
