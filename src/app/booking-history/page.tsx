
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ListOrdered, AlertTriangle, ShoppingBag, CalendarDays, User, Tag, Users } from 'lucide-react';
import type { CartItem } from '@/contexts/cart-context'; // For item structure if needed
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Added import

interface BookingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

interface BookingRecord {
  id: string;
  user_id: string;
  name: string; // Booker's name
  phone: string;
  travel_date: string; // YYYY-MM-DD
  items: BookingItem[];
  total_cost: number;
  currency: string;
  created_at: string; // ISO string
  status?: string;
}

export default function BookingHistoryPage() {
  const { user, isLoading: authLoading, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setIsLoadingBookings(false);
        return;
      }
      setIsLoadingBookings(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setBookings(data || []);
      } catch (err: any) {
        console.error("Error fetching bookings:", err.message || err);
        setError(err.message || "Failed to load your bookings.");
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (!authLoading) { // Only fetch if auth state is resolved
      if (user) {
        fetchBookings();
      } else {
         // If auth is loaded and there's no user, prompt login
        openAuthModal('signIn');
        setIsLoadingBookings(false);
      }
    }
  }, [user, authLoading, openAuthModal]);

  if (authLoading || isLoadingBookings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your booking history...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
     // This state should ideally be handled by AuthModal popping up
     // Or a redirect if preferred, but for now, this is a fallback message.
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          Please log in to view your booking history.
        </p>
        <Button onClick={() => openAuthModal('signIn')}>Login / Sign Up</Button>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Bookings</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold mb-2 flex items-center justify-center">
          <ListOrdered className="w-10 h-10 mr-3 text-primary" />
          Your Booking History
        </h1>
        <p className="text-muted-foreground text-lg">
          Review your past and upcoming adventures with Dubai Horizon.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Bookings Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't made any bookings. Time to explore!
          </p>
          <Button asChild>
            <Link href="/destinations">Start Exploring</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <CardTitle className="text-xl font-headline text-primary mb-1 sm:mb-0">
                        Booking ID: <span className="font-mono text-sm text-muted-foreground">{booking.id.substring(0,8)}...</span>
                    </CardTitle>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize w-fit mt-1 sm:mt-0">
                        Status: {booking.status || 'Pending'}
                    </Badge>
                </div>
                 <CardDescription className="text-xs text-muted-foreground pt-1">
                  Booked on: {format(new Date(booking.created_at), "PPP, p")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-accent" />
                    <span className="font-medium mr-1">Booked by:</span> {booking.name}
                </div>
                <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-accent" />
                    <span className="font-medium mr-1">Travel Date:</span> {format(new Date(booking.travel_date), "PPP")}
                </div>
                
                <div>
                  <h4 className="font-medium mb-1 text-sm text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2 text-accent" />Items Booked:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                    {booking.items.map(item => (
                      <li key={item.id}>
                        {item.name} (Qty: {item.quantity}) - {item.currency} {item.price.toFixed(2)} each
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 px-6 flex justify-end">
                <div className="text-lg font-semibold">
                  Total: <span className="text-primary">{booking.currency} {booking.total_cost.toFixed(2)}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
