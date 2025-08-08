
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Destination } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, Navigation } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import RatingDisplay from './rating-display';

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user, openAuthModal, setPostLoginAction } = useAuth();
  
  const isWishlisted = isInWishlist(destination.id);
  const isAddedToCart = isInCart(destination.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (isWishlisted) {
      removeFromWishlist(destination.id);
      toast({ title: `${destination.name} removed from wishlist.` });
    } else {
      addToWishlist(destination);
      toast({ title: `${destination.name} added to wishlist!` });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleBookNowOnCard = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with booking.",
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

    if (!isAddedToCart) {
      addToCart(destination);
      toast({
        title: `${destination.name} added to cart!`,
        description: "Proceeding to booking.",
      });
    }
    router.push('/cart');
  };
  
  const displayRating = destination.rating && destination.rating > 0;
  const reviewCount = destination.review_count || 0;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/destinations/${destination.id}`} className="block">
        <CardHeader className="p-0 relative">
          <Image
            src={destination.main_image_url || "https://placehold.co/400x250.png?text=No+Image"}
            alt={destination.name}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
            data-ai-hint={`${destination.type.join(' ')} landscape`}
          />
           <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={isWishlisted ? "fill-red-500 text-red-500 h-5 w-5" : "text-foreground h-5 w-5"} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-headline mb-1">{destination.name}</CardTitle>
          {displayRating ? (
            <div className="flex items-center mb-2">
                <RatingDisplay rating={destination.rating || 0} size={16}/>
                <span className="text-sm text-muted-foreground ml-1">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
            </div>
          ) : (
            <div className="flex items-center mb-2 h-[20px]">
                 <span className="text-sm text-muted-foreground">No reviews yet</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-2 h-16 overflow-hidden line-clamp-3">{destination.shortDescription}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {destination.type?.slice(0, 2).map(t => (
              <Badge key={t} variant="secondary" className="capitalize text-xs">{t}</Badge>
            ))}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 border-t mt-auto">
        <div className="flex justify-between items-center w-full">
          <Button
            variant="default" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleBookNowOnCard}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Book Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddToCart}
            disabled={isAddedToCart && user !== null}
            className={isAddedToCart && user !== null ? "bg-green-100 text-green-700" : ""}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isAddedToCart && user !== null ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
