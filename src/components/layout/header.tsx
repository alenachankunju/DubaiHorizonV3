
"use client";

import Link from 'next/link';
import { ShoppingCart, Heart, Menu, Compass, LogIn, UserCircle, LogOut, ListOrdered, ShieldCheck } from 'lucide-react';
import MainNav from './main-nav';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/wishlist-context';
import { useCart } from '@/contexts/cart-context';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN_EMAIL = 'maleficient1612@gmail.com';

export default function Header() {
  const { wishlistItems } = useWishlist();
  const { totalItems: cartTotalItems } = useCart();
  const { user, signOut, openAuthModal, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted && user && user.email === ADMIN_EMAIL;

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium mt-8">
          <SheetClose asChild><Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary"><Compass className="h-5 w-5" /> Home</Link></SheetClose>
          <SheetClose asChild><Link href="/destinations" className="flex items-center gap-2 text-foreground hover:text-primary"><Compass className="h-5 w-5" /> Destinations</Link></SheetClose>
          <SheetClose asChild><Link href="/ai-itinerary" className="flex items-center gap-2 text-foreground hover:text-primary"><Compass className="h-5 w-5" /> AI Itinerary</Link></SheetClose>
          <SheetClose asChild><Link href="/wishlist" className="flex items-center gap-2 text-foreground hover:text-primary"><Heart className="h-5 w-5" /> Wishlist ({mounted ? wishlistItems.length : 0})</Link></SheetClose>
          <SheetClose asChild><Link href="/cart" className="flex items-center gap-2 text-foreground hover:text-primary"><ShoppingCart className="h-5 w-5" /> Cart ({mounted ? cartTotalItems : 0})</Link></SheetClose>
          
          {mounted && user && (
            <SheetClose asChild>
              <Link href="/booking-history" className="flex items-center gap-2 text-foreground hover:text-primary">
                <ListOrdered className="h-5 w-5" /> Booking History
              </Link>
            </SheetClose>
          )}

          {isAdmin && (
             <SheetClose asChild>
              <Link href="/admin" className="flex items-center gap-2 text-foreground hover:text-primary">
                <ShieldCheck className="h-5 w-5" /> Admin Panel
              </Link>
            </SheetClose>
          )}

          {mounted && user ? (
            <SheetClose asChild>
                <Button variant="ghost" onClick={signOut} className="flex items-center gap-2 text-foreground hover:text-primary justify-start p-0 text-lg">
                    <LogOut className="h-5 w-5" /> Sign Out
                </Button>
            </SheetClose>
          ) : (
             mounted && !authLoading && ( 
                <SheetClose asChild>
                    <Button variant="ghost" onClick={() => openAuthModal()} className="flex items-center gap-2 text-foreground hover:text-primary justify-start p-0 text-lg">
                        <LogIn className="h-5 w-5" /> Login / Sign Up
                    </Button>
                </SheetClose>
            )
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  const UserMenu = () => {
    if (!mounted || authLoading) {
        return <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-muted animate-pulse hidden md:flex p-0" />;
    }
    if (!user) {
      return (
        <Button variant="outline" onClick={() => openAuthModal()} className="hidden md:flex">
          <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
        </Button>
      );
    }
    
    const userInitial = user.user_metadata?.first_name ? user.user_metadata.first_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full hidden md:flex p-0">
             <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                {userInitial}
             </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.first_name || 'User'} {user.user_metadata?.last_name || ''}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/booking-history"><ListOrdered className="mr-2 h-4 w-4" /> Booking History</Link>
          </DropdownMenuItem>
          {isAdmin && (
             <DropdownMenuItem asChild>
               <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {mounted && isMobile && <MobileNav />}
          <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0">
            <Compass className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary">Dubai Horizon</span>
          </Link>
        </div>

        <MainNav />

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link href="/wishlist" aria-label="Wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/cart" aria-label="Cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {cartTotalItems.toString()}
                </span>
              )}
            </Button>
          </Link>
          <div className="hidden md:flex">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
