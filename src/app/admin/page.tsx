
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LayoutDashboard, ListOrdered, Users, MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Stats {
  bookings: number;
  users: number | null;
  destinations: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch bookings, users (via RPC), and destinations count in parallel
        const [
          { count: bookingsCount, error: bookingsError },
          { data: usersData, error: usersError },
          { count: destinationsCount, error: destinationsError },
        ] = await Promise.all([
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
          supabase.rpc('get_total_users'), // Call the new database function
          supabase.from('featured_destinations').select('*', { count: 'exact', head: true }),
        ]);

        if (bookingsError) throw bookingsError;
        if (usersError) throw usersError;
        if (destinationsError) throw destinationsError;

        setStats({
          bookings: bookingsCount || 0,
          users: usersData,
          destinations: destinationsCount || 0,
        });
      } catch (err: any) {
        console.error("Error fetching admin stats:", err);
        let errorMessage = err.message || "Could not load dashboard statistics.";
        if (err.message?.includes("function get_total_users() does not exist")) {
            errorMessage = "The 'get_total_users' function was not found. Please ensure you have created it in your Supabase SQL Editor as per the instructions."
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summaryStats = [
    { title: "Total Bookings", value: stats?.bookings, icon: ListOrdered, link: "/admin/bookings" },
    { title: "Registered Users", value: stats?.users, icon: Users, link: "#" },
    { title: "Featured Destinations", value: stats?.destinations, icon: MapPin, link: "/admin/destinations" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-headline font-semibold">Welcome, Admin!</h2>
      <p className="text-muted-foreground">
        This is your control center. Manage bookings, users, and site content from here.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Statistics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          summaryStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value ?? 'N/A'}</div>
                {stat.link !== "#" ? (
                   <Link href={stat.link} className="text-xs text-muted-foreground hover:text-primary pt-1">
                      View Details
                   </Link>
                ): (
                  <p className="text-xs text-muted-foreground pt-1">{stat.value === null ? "Cannot be shown on client" : "Details coming soon"}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Perform common administrative tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
           <Link href="/admin/bookings" className="flex-1">
            <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center justify-center">
                <ListOrdered className="mr-2 h-5 w-5" /> Manage All Bookings
            </button>
           </Link>
          {/* Add more quick action buttons here as features are built */}
        </CardContent>
      </Card>

    </div>
  );
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  )
}
