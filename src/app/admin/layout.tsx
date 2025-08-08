
'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, LayoutDashboard, ListOrdered, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const ADMIN_EMAIL = 'maleficient1612@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, openAuthModal } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        openAuthModal('signIn');
        router.push('/'); 
      } else if (user.email !== ADMIN_EMAIL) {
        router.push('/'); 
      }
      setIsCheckingAuth(false);
    }
  }, [user, authLoading, router, openAuthModal]);

  if (authLoading || isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/')}>Go to Homepage</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-headline font-bold text-primary">Admin Panel</h1>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>Back to Site</Button>
        </div>
      </header>
      <div className="flex-grow container mx-auto flex flex-col md:flex-row py-6 gap-6">
        <nav className="w-full md:w-64 bg-card p-4 rounded-lg shadow-md md:sticky md:top-20 md:self-start">
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/bookings">
                  <ListOrdered className="mr-2 h-5 w-5" /> All Bookings
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/destinations">
                  <MapPin className="mr-2 h-5 w-5" /> Destinations
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
        <main className="flex-grow bg-card p-6 rounded-lg shadow-md">
          {children}
        </main>
      </div>
    </div>
  );
}
