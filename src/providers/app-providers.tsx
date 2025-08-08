
"use client";

import type React from 'react';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { CartProvider } from '@/contexts/cart-context';
import { AuthProvider } from '@/contexts/auth-context'; // Import AuthProvider
import AuthModal from '@/components/auth/auth-modal'; // Import AuthModal

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <WishlistProvider>
        <CartProvider>
          {children}
          <AuthModal /> {/* Render AuthModal globally so it can be triggered from anywhere */}
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
};
