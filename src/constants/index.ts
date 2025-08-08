
import type { DestinationType } from '@/types';

export const DESTINATION_TYPES: { value: DestinationType; label: string }[] = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'desert', label: 'Desert' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'family', label: 'Family Friendly' },
];

// MOCK_DESTINATIONS and getDestinationById are removed as data will come from Supabase.
// If you need example data for testing the new schema locally, you can insert it into your Supabase table.
