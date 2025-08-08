"use client";

import { useWishlist } from '@/contexts/wishlist-context';
import DestinationCard from '@/components/shared/destination-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeartCrack, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, clearWishlist } = useWishlist();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-4xl font-headline font-bold mb-4 sm:mb-0">Your Wishlist</h1>
        {wishlistItems.length > 0 && (
          <Button variant="outline" onClick={clearWishlist} className="text-destructive hover:bg-destructive/10">
            <HeartCrack className="mr-2 h-4 w-4" /> Clear Wishlist
          </Button>
        )}
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Start exploring and add your favorite destinations to your wishlist!
          </p>
          <Button asChild>
            <Link href="/destinations">
              <ArrowLeft className="mr-2 h-4 w-4" /> Explore Destinations
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
