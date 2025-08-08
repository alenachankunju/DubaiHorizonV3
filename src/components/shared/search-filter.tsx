"use client";

import type React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Destination, DestinationType } from '@/types';
import { DESTINATION_TYPES } from '@/constants';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';

interface SearchFilterProps {
  destinations: Destination[];
  onFilterChange: (filteredDestinations: Destination[]) => void;
}

export default function SearchFilter({ destinations, onFilterChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<DestinationType | 'all'>('all');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    filterDestinations(term, selectedType);
  };

  const handleTypeChange = (type: DestinationType | 'all') => {
    setSelectedType(type);
    filterDestinations(searchTerm, type);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    onFilterChange(destinations);
  }

  const filterDestinations = (term: string, type: DestinationType | 'all') => {
    let filtered = destinations;

    if (term) {
      filtered = filtered.filter(dest =>
        dest.name.toLowerCase().includes(term) ||
        dest.shortDescription.toLowerCase().includes(term) ||
        (dest.tags && dest.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (type !== 'all') {
      filtered = filtered.filter(dest => dest.type.includes(type));
    }
    onFilterChange(filtered);
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Search Destinations</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="e.g., Burj Khalifa, Desert Safari, Beach"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-foreground mb-1">Filter by Type</label>
          <Select value={selectedType} onValueChange={(value) => handleTypeChange(value as DestinationType | 'all')}>
            <SelectTrigger id="type-filter" className="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DESTINATION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value} className="capitalize">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         {(searchTerm || selectedType !== 'all') && (
          <Button onClick={clearFilters} variant="outline" className="md:col-start-3">
            <X className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
