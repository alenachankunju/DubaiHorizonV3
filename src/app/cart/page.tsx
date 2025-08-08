
"use client";

import { useCart } from '@/contexts/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import BookingForm from '@/components/cart/booking-form';
import type { CartItem } from '@/contexts/cart-context';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalItems, totalCost } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    } else if (newQuantity === 0) {
      removeFromCart(itemId);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added any destinations to your cart yet.
        </p>
        <Button asChild>
          <Link href="/destinations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Start Exploring
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold text-center">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item: CartItem) => (
            <Card key={item.id} className="flex flex-col sm:flex-row overflow-hidden shadow-sm">
              <div className="relative w-full sm:w-1/3 h-48 sm:h-auto aspect-[4/3] sm:aspect-auto">
                <Image
                  src={item.main_image_url || "https://placehold.co/600x400.png?text=No+Image"} // Use main_image_url
                  alt={item.name}
                  fill
                  style={{ objectFit: "cover" }}
                  data-ai-hint={`${item.type.join(' ')} attraction`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xl font-headline mb-1">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">{item.shortDescription}</p>
                  <p className="text-lg font-semibold text-primary">
                    {item.price > 0 ? `${item.currency} ${item.price}` : 'Free'}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  {item.price > 0 ? (
                     <div className="flex items-center space-x-2">
                      <label htmlFor={`quantity-${item.id}`} className="text-sm">Qty:</label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-16 h-8 text-center"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 font-medium">Free Experience</p>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold">
                <span>Total Cost:</span>
                <span className="text-primary">{cartItems[0]?.currency || 'AED'} {totalCost.toFixed(2)}</span>
              </div>
              <Separator />
              <h3 className="text-xl font-headline mt-2">Your Details</h3>
              <BookingForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
