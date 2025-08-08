
export type DestinationType =
  | 'adventure'
  | 'luxury'
  | 'cultural'
  | 'desert'
  | 'relaxation'
  | 'family';

// Represents a single review from the new 'reviews' table
export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  destination_id: string;
  comment: string | null;
  rating: number; // 1-5
  created_at: string;
  featured_destinations?: { name: string }; // For joined queries
}

// Updated Destination type
// The 'rating' field will now hold the calculated average rating.
export interface Destination {
  id: string;
  name: string;
  shortDescription: string; // Corresponds to short_description in DB
  description: string;
  main_image_url: string;
  gallery_image_urls?: string[];
  type: DestinationType[];
  price: number;
  currency: string;
  rating?: number; // Holds the calculated average rating
  review_count?: number; // Holds the total number of reviews
  location_address: string;
  availability: string;
  features?: string[];
  tags?: string[];
  reviews?: Review[]; // Populated on the destination detail page
}
