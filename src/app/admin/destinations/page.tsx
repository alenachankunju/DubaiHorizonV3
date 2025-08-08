
"use client";

import { useEffect, useState } from 'react';
import DestinationForm from "@/components/admin/destination-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import type { Destination } from '@/types';
import { Loader2, MapPin, PlusCircle, Edit3, Trash2, AlertTriangle, List } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDestinations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('featured_destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const typedData = (data || []).map(d => ({
        ...d,
        shortDescription: d.short_description,
        main_image_url: d.main_image_url,
        gallery_image_urls: d.gallery_image_urls || [],
        location_address: d.location_address,
        type: d.types || [], // ensure 'types' is always an array
        features: d.features || [],
        tags: d.tags || [],
        reviews: [], 
      })) as Destination[];
      setDestinations(typedData);
    } catch (err: any) {
      console.error("Error fetching destinations:", err);
      setError(err.message || "Failed to load destinations.");
      toast({ title: "Error", description: err.message || "Failed to load destinations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleDeleteDestination = async (destinationId: string, destinationName: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('featured_destinations')
        .delete()
        .eq('id', destinationId);

      if (deleteError) throw deleteError;

      toast({
        title: "Destination Deleted",
        description: `${destinationName} has been successfully deleted.`,
      });
      fetchDestinations(); // Refresh the list
    } catch (err: any) {
      console.error(`Error deleting destination ${destinationId}:`, err);
      toast({
        title: "Error Deleting Destination",
        description: err.message || `Could not delete ${destinationName}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handleFormSubmitSuccess = () => {
    fetchDestinations(); // Refresh list after adding new destination
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-headline font-semibold">Manage Featured Destinations</h2>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <PlusCircle className="mr-2 h-5 w-5 text-primary" />
            Add New Featured Destination
          </CardTitle>
          <CardDescription>
            Fill in the details below to add a new destination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DestinationForm onFormSubmitSuccess={handleFormSubmitSuccess} />
        </CardContent>
      </Card>

      <div className="mt-12">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <List className="mr-2 h-5 w-5 text-primary" />
                    Existing Destinations
                </CardTitle>
                <CardDescription>
                    View, edit, or delete current featured destinations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading destinations...</p>
                    </div>
                )}
                {!isLoading && error && (
                    <div className="text-destructive text-center py-10">
                        <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
                        <p>{error}</p>
                    </div>
                )}
                {!isLoading && !error && destinations.length === 0 && (
                    <p className="text-muted-foreground text-center py-10">
                    No destinations found. Add one using the form above!
                    </p>
                )}
                {!isLoading && !error && destinations.length > 0 && (
                    <div className="space-y-4">
                    {destinations.map((dest) => (
                        <Card key={dest.id} className="p-4 border bg-muted/20 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex-grow">
                            <h3 className="font-semibold text-lg text-primary">{dest.name}</h3>
                            <p className="text-xs text-muted-foreground">Price: {dest.currency} {dest.price}</p>
                            <p className="text-xs text-muted-foreground">Type(s): {dest.type?.join(', ') || 'N/A'}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/destinations/edit/${dest.id}`}>
                                <Edit3 className="mr-1 h-4 w-4" /> Edit
                            </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the destination "{dest.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteDestination(dest.id, dest.name)}>
                                    Yes, delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        </Card>
                    ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
