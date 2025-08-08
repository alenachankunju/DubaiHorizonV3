
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface ImageGalleryProps {
  mainImage: string; // Primary image
  galleryImages: string[]; // Array of gallery images
  altText: string;
}

export default function ImageGallery({ mainImage, galleryImages, altText }: ImageGalleryProps) {
  const allImages = [mainImage, ...galleryImages.filter(img => img !== mainImage)]; // Ensure mainImage is first and unique
  const [selectedImage, setSelectedImage] = useState(allImages[0] || "https://placehold.co/800x600.png?text=No+Image");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset if images change
    const effectiveImages = [mainImage, ...galleryImages.filter(img => img !== mainImage)];
    setSelectedImage(effectiveImages[0] || "https://placehold.co/800x600.png?text=No+Image");
    setCurrentIndex(0);
  }, [mainImage, galleryImages]);


  if (!allImages || allImages.length === 0 || !allImages[0]) {
    // Display a default placeholder if no images are available
    return (
        <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0 relative aspect-[16/10]">
                <Image
                    src="https://placehold.co/800x600.png?text=No+Images+Available"
                    alt={`${altText} - No images available`}
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                />
            </CardContent>
        </Card>
    );
  }
  
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(allImages[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(allImages[prevIndex]);
  };


  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0 relative aspect-[16/10]">
          <Image
            src={selectedImage}
            alt={`${altText} - main view ${currentIndex + 1}`}
            fill
            style={{ objectFit: "cover" }}
            className="transition-opacity duration-300 ease-in-out"
            data-ai-hint="travel destination"
            priority={currentIndex === 0}
            key={selectedImage} // Add key to force re-render on image change
          />
           {allImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {allImages.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(image);
                setCurrentIndex(index);
              }}
              className={cn(
                'overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 aspect-square relative',
                image === selectedImage && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <Image
                src={image}
                alt={`${altText} - thumbnail ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform hover:scale-105"
                data-ai-hint="travel thumbnail"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
