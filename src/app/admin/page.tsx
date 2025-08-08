
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LayoutDashboard, ListOrdered, Users, MapPin } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  // In a real app, you might fetch some summary data here
  const summaryStats = [
    { title: "Total Bookings", value: "125", icon: ListOrdered, link: "/admin/bookings" },
    { title: "Registered Users", value: "42", icon: Users, link: "#" }, // Link can be to a user management page later
    { title: "Featured Destinations", value: "5", icon: MapPin, link: "#" }, // Link to destinations management
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-headline font-semibold">Welcome, Admin!</h2>
      <p className="text-muted-foreground">
        This is your control center. Manage bookings, users, and site content from here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.link !== "#" ? (
                 <Link href={stat.link} className="text-xs text-muted-foreground hover:text-primary pt-1">
                    View Details
                 </Link>
              ): (
                <p className="text-xs text-muted-foreground pt-1">Details coming soon</p>
              )}
            </CardContent>
          </Card>
        ))}
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
