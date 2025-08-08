
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DestinationForm from "@/components/admin/destination-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import type { Destination } from '@/types';
import { Loader2, Edit3, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function EditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDestination = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { data, error: fetchError } = await supabase
            .from('featured_destinations')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          
          if (data) {
             const typedData = {
              ...data,
              id: data.id,
              shortDescription: data.short_description,
              main_image_url: data.main_image_url,
              gallery_image_urls: data.gallery_image_urls || [],
              location_address: data.location_address,
              type: data.types || [],
              features: data.features || [],
              tags: data.tags || [],
              reviews: [], 
            } as Destination;
            setDestination(typedData);
          } else {
            setError("Destination not found.");
            setDestination(null);
          }
        } catch (err: any) {
          console.error(`Error fetching destination ${id} for edit:`, err.message || err);
          setError(err.message || `Failed to load destination details.`);
          setDestination(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDestination();
    } else {
      setError("No destination ID provided.");
      setIsLoading(false);
    }
  }, [id]);
  
  const handleFormSubmitSuccess = () => {
    toast({
        title: "Update Successful",
        description: `Destination "${destination?.name || 'Item'}" has been updated.`,
    });
    router.push('/admin/destinations');
    router.refresh(); 
  }


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-destructive">Error Loading Destination</h1>
        <p className="text-muted-foreground mb-6">{error || "Could not find the destination."}</p>
        <Button asChild variant="outline">
          <Link href="/admin/destinations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations List
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/admin/destinations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations List
        </Link>
       </Button>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Edit3 className="mr-2 h-5 w-5 text-primary" />
            Edit Destination: {destination.name}
          </CardTitle>
          <CardDescription>
            Modify the details for this featured destination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DestinationForm initialData={destination} onFormSubmitSuccess={handleFormSubmitSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
