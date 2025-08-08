
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ListFilter, AlertTriangle, Users, CalendarDays, BadgeDollarSign, ShoppingBag, Info, Save } from 'lucide-react';
import type { CartItem } from '@/contexts/cart-context';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context'; 
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Re-defining here as it might differ slightly or for admin-specific views
interface AdminBookingItem {
  id: string; // Product ID
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

interface AdminBookingRecord {
  id: string; // Booking ID
  user_id: string;
  name: string; // Booker's name
  phone: string;
  travel_date: string; // YYYY-MM-DD
  items: AdminBookingItem[];
  total_cost: number;
  currency: string;
  created_at: string; // ISO string
  status?: string;
  // users field is now truly optional as we are removing the join for diagnostics
  users?: { email?: string; id?: string } | null; // User details might not be fetched
}

const ADMIN_EMAIL = 'maleficient1612@gmail.com';

export default function AdminBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<AdminBookingRecord[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editableStatuses, setEditableStatuses] = useState<{[key: string]: string}>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || user.email !== ADMIN_EMAIL) {
        setIsLoadingBookings(false);
        if (!authLoading) router.push('/'); 
        return;
      }
      setIsLoadingBookings(true);
      setError(null);
      try {
        // DIAGNOSTIC CHANGE: Fetch bookings without joining users table temporarily
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*') // Removed the join: users!user_id (id, email)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        const bookingsWithOptionalUsers = (data || []).map(b => ({...b, users: b.users || null}));
        setBookings(bookingsWithOptionalUsers);

        // Initialize editable statuses for dropdowns
        const initialStatuses = (data || []).reduce((acc: {[key: string]: string}, booking) => {
            acc[booking.id] = booking.status || 'pending';
            return acc;
        }, {});
        setEditableStatuses(initialStatuses);

      } catch (err: any) {
        console.error("Error fetching all bookings:", err.message || err);
        setError(err.message || "Failed to load bookings.");
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (!authLoading) { 
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setEditableStatuses(prev => ({ ...prev, [bookingId]: newStatus }));
  };

  const handleUpdateStatus = async (bookingId: string) => {
    const newStatus = editableStatuses[bookingId];
    if (!newStatus) {
        toast({ title: "No Status Selected", description: "Please select a status to update.", variant: "destructive"});
        return;
    }

    setIsUpdatingStatus(bookingId);
    try {
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        setBookings(prevBookings =>
            prevBookings.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );

        toast({
            title: "Status Updated",
            description: `Booking has been updated to ${newStatus}.`,
        });
    } catch (err: any) {
        console.error("Error updating booking status:", err);
        toast({
            title: "Update Failed",
            description: err.message || "Could not update the booking status.",
            variant: "destructive",
        });
    } finally {
        setIsUpdatingStatus(null);
    }
  };


  if (authLoading || isLoadingBookings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading all bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Bookings</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-3xl font-headline font-semibold mb-2 sm:mb-0">All User Bookings</h2>
        <Button variant="outline" disabled>
          <ListFilter className="mr-2 h-4 w-4" /> Filter Bookings (Soon)
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground">There are currently no bookings in the system.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="shadow-sm">
              <CardHeader className="pb-3 bg-muted/20 rounded-t-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-primary">
                        Booking ID: <span className="font-mono text-sm text-foreground">{booking.id.substring(0,8)}...</span>
                    </CardTitle>
                    <Badge
                        variant={
                          booking.status === 'confirmed' || booking.status === 'completed' 
                          ? 'default' 
                          : booking.status === 'cancelled' 
                          ? 'destructive' 
                          : 'secondary'
                        }
                        className="capitalize w-fit"
                    >
                        {booking.status || 'Pending'}
                    </Badge>
                </div>
                 <CardDescription className="text-xs text-muted-foreground pt-1">
                  Booked on: {format(new Date(booking.created_at), "PPP, p")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
                        <span className="font-medium mr-1">Booker:</span> {booking.name}
                    </div>
                     <div className="flex items-center">
                        <Info className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
                        <span className="font-medium mr-1">User Email:</span> {booking.users?.email || 'N/A (join removed for test)'}
                    </div>
                    <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
                        <span className="font-medium mr-1">Travel Date:</span> {format(new Date(booking.travel_date), "PPP")}
                    </div>
                    <div className="flex items-center">
                        <BadgeDollarSign className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
                        <span className="font-medium mr-1">Total:</span> {booking.currency} {booking.total_cost.toFixed(2)}
                    </div>
                </div>

                <div>
                  <h4 className="font-medium text-xs text-muted-foreground mt-2 mb-1">Items:</h4>
                  <ul className="list-disc list-inside pl-4 space-y-0.5 text-xs">
                    {booking.items.map(item => (
                      <li key={item.id}>
                        {item.name} (Qty: {item.quantity}) - {item.currency} {item.price.toFixed(2)} each
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 py-2 px-4 flex justify-end items-center gap-2 rounded-b-lg border-t">
                <Select
                  value={editableStatuses[booking.id] || 'pending'}
                  onValueChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                  disabled={isUpdatingStatus === booking.id}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(booking.id)}
                  disabled={isUpdatingStatus === booking.id || (editableStatuses[booking.id] === (booking.status || 'pending'))}
                >
                  {isUpdatingStatus === booking.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Update
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
