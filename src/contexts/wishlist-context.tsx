
"use client";

import type { Destination } from '@/types';
import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface WishlistContextType {
  wishlistItems: Destination[];
  addToWishlist: (item: Destination) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'dubaiHorizonWishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Destination[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        try {
          setWishlistItems(JSON.parse(storedWishlist));
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage", error);
          localStorage.removeItem(WISHLIST_STORAGE_KEY); // Clear corrupted data
        }
      }
    }
  }, []); // Runs once on client mount

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems]);


  const addToWishlist = useCallback((item: Destination) => {
    setWishlistItems((prevItems) => {
      if (prevItems.find(i => i.id === item.id)) {
        return prevItems; // Item already in wishlist
      }
      return [...prevItems, item];
    });
  }, []);

  const removeFromWishlist = useCallback((itemId: string) => {
    setWishlistItems((prevItems) => prevItems.filter(item => item.id !== itemId));
  }, []);

  const isInWishlist = useCallback((itemId: string) => {
    return wishlistItems.some(item => item.id === itemId);
  }, [wishlistItems]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);
  
  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
