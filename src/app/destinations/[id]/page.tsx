
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Destination, Review } from '@/types';
import ImageGallery from '@/components/destinations/image-gallery';
import RatingDisplay from '@/components/shared/rating-display';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart, Navigation, CalendarDays, Users, Tag, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabaseClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReviewsList from '@/components/destinations/reviews-list';
import ReviewForm from '@/components/destinations/review-form';

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [destination, setDestination] = useState<Destination | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const { user, openAuthModal, setPostLoginAction } = useAuth();

  const handleReviewSubmitted = useCallback((newReview: Review) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    // Optionally, you could refetch the destination to get the new average rating,
    // but updating it client-side is faster for the user.
    if (destination) {
      const totalRating = (destination.rating || 0) * (destination.review_count || 0) + newReview.rating;
      const newReviewCount = (destination.review_count || 0) + 1;
      setDestination({
        ...destination,
        rating: totalRating / newReviewCount,
        review_count: newReviewCount
      });
    }
  }, [destination]);

  useEffect(() => {
    if (id) {
      const fetchDestinationAndReviews = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch destination details
          const { data: destData, error: destError } = await supabase
            .from('featured_destinations')
            .select('*')
            .eq('id', id)
            .single();

          if (destError) throw destError;
          if (!destData) {
            setError("Destination not found.");
            setIsLoading(false);
            return;
          }

          // Fetch reviews
          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .select('*')
            .eq('destination_id', id)
            .order('created_at', { ascending: false });

          if (reviewError) throw reviewError;

          setReviews(reviewData || []);

          // Calculate average rating
          const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = reviewData.length > 0 ? totalRating / reviewData.length : 0;

          const typedData = {
            ...destData,
            shortDescription: destData.short_description,
            main_image_url: destData.main_image_url,
            gallery_image_urls: destData.gallery_image_urls || [],
            location_address: destData.location_address,
            type: destData.types || [],
            features: destData.features || [],
            tags: destData.tags || [],
            reviews: reviewData || [],
            rating: averageRating,
            review_count: reviewData.length,
          } as Destination;
          setDestination(typedData);
        } catch (err: any) {
          console.error(`Error fetching destination ${id}:`, err);
          setError(err.message || `Failed to load destination details.`);
          setDestination(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDestinationAndReviews();
    } else {
      setIsLoading(false);
      setError("No destination ID provided.");
    }
  }, [id]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error && !destination) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Destination</AlertTitle>
        <AlertDescription>
          {error}
          <br />
          <Button asChild variant="link" className="p-0 h-auto mt-2">
            <Link href="/destinations">Back to Destinations</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!destination) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-4">Destination Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the destination you're looking for.</p>
        <Button asChild variant="outline">
          <Link href="/destinations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
          </Link>
        </Button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(destination.id);
  const isAddedToCart = isInCart(destination.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(destination.id);
      toast({ title: `${destination.name} removed from wishlist.` });
    } else {
      addToWishlist(destination);
      toast({ title: `${destination.name} added to wishlist!` });
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
      });
      setPostLoginAction(() => () => {
        addToCart(destination);
        toast({ title: `${destination.name} added to cart!`});
      });
      openAuthModal('signIn');
      return;
    }
    if(!isAddedToCart) {
      addToCart(destination);
      toast({ title: `${destination.name} added to cart!` });
    } else {
       toast({ title: `${destination.name} is already in cart.`, variant: "default" });
    }
  };
  
  const handleBookNow = () => {
    // Check if the product is 'Burj Khalifa' and redirect to Stripe
    if (destination.name === 'Burj Khalifa') {
      const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
      if (stripeLink && stripeLink !== 'YOUR_STRIPE_PAYMENT_LINK_HERE') {
        router.push(stripeLink);
        return;
      } else {
        toast({
          title: "Booking Not Available",
          description: "The payment link for this product is not configured yet.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Default flow for all other products
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book.",
      });
      setPostLoginAction(() => () => {
        if (!isInCart(destination.id)) {
             addToCart(destination);
        }
        router.push('/cart');
      });
      openAuthModal('signIn');
      return;
    }
    if(!isAddedToCart){
      addToCart(destination);
    }
    router.push('/cart');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link href="/destinations" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all destinations
      </Link>

      <ImageGallery 
        mainImage={destination.main_image_url}
        galleryImages={destination.gallery_image_urls || []} 
        altText={destination.name} 
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-2">{destination.name}</h1>
              {(destination.rating && destination.rating > 0) && (
                <div className="flex items-center space-x-2 mb-2">
                  <RatingDisplay rating={destination.rating} showText />
                  <span className="text-sm text-muted-foreground">({destination.review_count} {destination.review_count === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {destination.type.map(t => (
                  <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>
                ))}
                 {destination.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="capitalize"><Tag className="w-3 h-3 mr-1"/>{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button variant={isWishlisted ? "secondary" : "outline"} onClick={handleWishlistToggle} className="w-full">
              <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
            <Button onClick={handleAddToCart} disabled={isAddedToCart && user !== null} className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
               {isAddedToCart && user !== null ? 'In Cart' : 'Add to Cart'}
            </Button>
            <Button 
              onClick={handleBookNow}
              variant="default" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>

          <Separator className="my-6" />

          <h2 className="text-2xl font-headline mb-3">About {destination.name}</h2>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{destination.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-xl font-headline mb-2">Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-primary" /> Availability: {destination.availability}</li>
                 {destination.features && destination.features.length > 0 && (
                  <li className="flex items-start"><Users className="w-4 h-4 mr-2 mt-1 text-primary" /> Features: {destination.features.join(', ')}</li>
                )}
                 <li className="flex items-start"><Navigation className="w-4 h-4 mr-2 mt-1 text-primary" /> Location: {destination.location_address}</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <ReviewsList reviews={reviews} averageRating={destination.rating || 0} />

          <Separator className="my-6" />

          <div>
             <h3 className="text-2xl font-headline mb-4">Leave a Review</h3>
             <ReviewForm destinationId={destination.id} onReviewSubmitted={handleReviewSubmitted} />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

function DetailPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <Skeleton className="h-8 w-1/4 mb-4 bg-muted" />
      
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full rounded-lg bg-muted" />
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-md bg-muted" />)}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div>
              <Skeleton className="h-10 w-3/4 mb-2 bg-muted" />
              <Skeleton className="h-6 w-1/2 mb-2 bg-muted" />
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                <Skeleton className="h-6 w-24 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-10 w-full rounded-md bg-muted" />
            <Skeleton className="h-10 w-full rounded-md bg-muted" />
            <Skeleton className="h-10 w-full rounded-md bg-muted" />
          </div>
          <Separator className="my-6" />
          <Skeleton className="h-8 w-1/3 mb-3 bg-muted" />
          <Skeleton className="h-4 w-full mb-2 bg-muted" />
          <Skeleton className="h-4 w-full mb-2 bg-muted" />
          <Skeleton className="h-4 w-5/6 mb-6 bg-muted" />
          
          <Skeleton className="h-8 w-1/4 mb-2 bg-muted" />
          <Skeleton className="h-4 w-full mb-1 bg-muted" />
          <Skeleton className="h-4 w-full mb-6 bg-muted" />
          
          <Separator className="my-6" />
          <Skeleton className="h-8 w-1/3 mb-4 bg-muted" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-muted/30 p-4">
                <Skeleton className="h-5 w-1/4 mb-1 bg-muted" />
                <Skeleton className="h-3 w-1/5 mb-2 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
