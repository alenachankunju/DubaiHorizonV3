import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold text-primary mb-2">Dubai Horizon</h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate guide to exploring the wonders of Dubai.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/destinations" className="text-muted-foreground hover:text-primary">Destinations</Link></li>
              <li><Link href="/ai-itinerary" className="text-muted-foreground hover:text-primary">AI Itinerary Planner</Link></li>
              <li><Link href="/wishlist" className="text-muted-foreground hover:text-primary">Wishlist</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary">Booking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-2">Connect With Us</h4>
            <div className="flex space-x-4 mb-2">
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary"><Youtube size={20} /></a>
            </div>
            <p className="text-sm text-muted-foreground">Email: info@dubaihorizon.com</p>
            <p className="text-sm text-muted-foreground">Phone: +971 4 123 4567</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dubai Horizon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
