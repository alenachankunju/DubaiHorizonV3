
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DESTINATION_TYPES } from "@/constants";
import type { Destination } from "@/types";
import { Loader2, PlusCircle, Save, UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';

// Schema for the form
const destinationFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  shortDescription: z.string().min(10, { message: "Short description is required." }),
  description: z.string().min(20, { message: "Full description is required." }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number or zero." }),
  currency: z.string().default("AED"),
  types: z.array(z.string()).min(1, { message: "Select at least one destination type." }),
  location_address: z.string().min(5, { message: "Location address is required." }),
  availability: z.string().min(3, { message: "Availability information is required." }),
  features_string: z.string().optional().describe("Comma-separated features"),
  tags_string: z.string().optional().describe("Comma-separated tags"),
  main_image_url: z.string().optional().nullable(),
  gallery_image_urls: z.array(z.string()).optional(),
});

type DestinationFormValues = z.infer<typeof destinationFormSchema>;

interface DestinationFormProps {
  initialData?: Partial<Destination> & { id?: string };
  onFormSubmitSuccess?: () => void;
}

export default function DestinationForm({ initialData, onFormSubmitSuccess }: DestinationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData?.id;

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialData?.main_image_url || null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(initialData?.gallery_image_urls || []);

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      currency: initialData?.currency || "AED",
      types: initialData?.type || [],
      location_address: initialData?.location_address || "",
      availability: initialData?.availability || "",
      features_string: initialData?.features?.join(', ') || "",
      tags_string: initialData?.tags?.join(', ') || "",
      main_image_url: initialData?.main_image_url || null,
      gallery_image_urls: initialData?.gallery_image_urls || [],
    },
  });
  
  useEffect(() => {
    form.reset({
      name: initialData?.name || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      currency: initialData?.currency || "AED",
      types: initialData?.type || [],
      location_address: initialData?.location_address || "",
      availability: initialData?.availability || "",
      features_string: initialData?.features?.join(', ') || "",
      tags_string: initialData?.tags?.join(', ') || "",
      main_image_url: initialData?.main_image_url || null,
      gallery_image_urls: initialData?.gallery_image_urls || [],
    });
    setMainImagePreview(initialData?.main_image_url || null);
    setGalleryImagePreviews(initialData?.gallery_image_urls || []);
    setGalleryImageFiles([]);
    setMainImageFile(null);
  }, [initialData, form]);

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    } else {
      setMainImageFile(null);
      setMainImagePreview(initialData?.main_image_url || null);
    }
  };

  const handleGalleryImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setGalleryImageFiles(newFiles);
      setGalleryImagePreviews(newFiles.map(file => URL.createObjectURL(file)));
    } else {
      setGalleryImageFiles([]);
      setGalleryImagePreviews(initialData?.gallery_image_urls || []);
    }
  };
  
  const removeGalleryPreview = (index: number) => {
    // This function now handles a combined list of old and new previews
    const newPreviews = [...galleryImagePreviews];
    const newFiles = [...galleryImageFiles];
    
    const removedPreview = newPreviews.splice(index, 1)[0];
    
    // Check if the removed preview was a newly staged file
    const fileIndex = newFiles.findIndex(file => URL.createObjectURL(file) === removedPreview);
    if (fileIndex > -1) {
        newFiles.splice(fileIndex, 1);
    }
    
    setGalleryImagePreviews(newPreviews);
    setGalleryImageFiles(newFiles);
  };

  const processStringToArray = (str: string | undefined): string[] => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  async function uploadFile(file: File): Promise<string | null> {
    const bucketName = 'destinations';
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    try {
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filename, file, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
        return urlData?.publicUrl || null;

    } catch (uploadError: any) {
        console.error(`Error uploading ${file.name}:`, uploadError);
        toast({
            title: `Upload Error: ${file.name}`,
            description: uploadError.message || "Could not upload file.",
            variant: "destructive",
        });
        return null;
    }
  }


  async function onSubmit(values: DestinationFormValues) {
    setIsSubmitting(true);

    let finalMainImageUrl: string | null = initialData?.main_image_url || null;
    if (mainImageFile) {
      const uploadedPath = await uploadFile(mainImageFile);
      if (uploadedPath) {
        finalMainImageUrl = uploadedPath;
      } else {
        setIsSubmitting(false);
        return; // Stop submission if main image fails to upload
      }
    }

    let existingGalleryUrls = galleryImagePreviews.filter(p => p.startsWith('https://'));
    const uploadedGalleryUrls: string[] = [];

    for (const file of galleryImageFiles) {
        const uploadedPath = await uploadFile(file);
        if (uploadedPath) {
            uploadedGalleryUrls.push(uploadedPath);
        }
        // Decide if you want to stop on failure or just skip the failed ones
    }
    const finalGalleryImageUrls = [...existingGalleryUrls, ...uploadedGalleryUrls];

    const destinationDataToSave: any = {
      name: values.name,
      short_description: values.shortDescription,
      description: values.description,
      price: values.price,
      currency: values.currency,
      types: Array.isArray(values.types) ? values.types : [],
      location_address: values.location_address,
      availability: values.availability,
      features: processStringToArray(values.features_string),
      tags: processStringToArray(values.tags_string),
      main_image_url: finalMainImageUrl,
      gallery_image_urls: finalGalleryImageUrls,
    };
    
    try {
      let upsertError: any;

      if (isEditMode && initialData?.id) {
        const { error: updateError } = await supabase
          .from("featured_destinations")
          .update(destinationDataToSave)
          .eq('id', initialData.id);
        upsertError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("featured_destinations")
          .insert([destinationDataToSave]);
        upsertError = insertError;
      }

      if (upsertError) {
        console.error(`Supabase upsert error:`, upsertError.message || upsertError);
        throw upsertError;
      }

      toast({
        title: isEditMode ? "Destination Updated!" : "Destination Added!",
        description: `${values.name} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      });
      
      if (!isEditMode) {
        form.reset();
        setMainImageFile(null);
        setMainImagePreview(null);
        setGalleryImageFiles([]);
        setGalleryImagePreviews([]);
      }

      if (onFormSubmitSuccess) {
        onFormSubmitSuccess();
      } else {
        router.refresh();
        if (isEditMode) router.push('/admin/destinations');
      }

    } catch (error: any) {
       let errorMessage = "An unexpected error occurred. Please try again.";
      if (error && typeof error.message === 'string') {
        errorMessage = error.message;
        if (errorMessage.toLowerCase().includes("failed to fetch")) {
          errorMessage = "Network error: Failed to connect to the server. Please check your internet connection.";
        }
      }
      toast({
        title: `Error ${isEditMode ? 'Updating' : 'Adding'} Destination`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Name</FormLabel>
              <FormControl><Input placeholder="e.g., Burj Khalifa" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl><Textarea placeholder="A brief overview (for cards)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description</FormLabel>
              <FormControl><Textarea placeholder="Detailed description of the destination" {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Main Image</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" onChange={handleMainImageChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
          </FormControl>
          {mainImagePreview && (
            <div className="mt-2 relative w-48 h-32 border rounded-md overflow-hidden">
              <Image src={mainImagePreview} alt="Main image preview" layout="fill" objectFit="cover" />
            </div>
          )}
          <FormDescription>Upload the primary display image for the destination.</FormDescription>
           <FormField control={form.control} name="main_image_url" render={() => <FormMessage />} />
        </FormItem>

        <FormItem>
          <FormLabel>Gallery Images</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
          </FormControl>
          {galleryImagePreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {galleryImagePreviews.map((previewSrc, index) => (
                <div key={previewSrc + index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                  <Image src={previewSrc} alt={`Gallery preview ${index + 1}`} layout="fill" objectFit="cover" />
                   <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeGalleryPreview(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <FormDescription>Upload additional images for the gallery. New uploads will replace existing gallery images if editing.</FormDescription>
          <FormField control={form.control} name="gallery_image_urls" render={() => <FormMessage />} />
        </FormItem>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 150" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl><Input placeholder="AED" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="types"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Destination Types</FormLabel>
                <FormDescription>Select one or more relevant types.</FormDescription>
              </div>
              {DESTINATION_TYPES.map((item) => (
                <FormField
                  key={item.value}
                  control={form.control}
                  name="types"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.value}
                        className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.value])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item.value
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal capitalize">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Address</FormLabel>
              <FormControl><Input placeholder="e.g., 1 Sheikh Mohammed bin Rashid Blvd, Dubai" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl><Input placeholder="e.g., Daily, 9 AM - 11 PM" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="features_string"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (comma-separated)</FormLabel>
              <FormControl><Textarea placeholder="e.g., Observation Deck, High-speed elevators" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags_string"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl><Textarea placeholder="e.g., skyscraper, views, iconic" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
          {isEditMode ? "Save Changes" : "Add Destination"}
        </Button>
      </form>
    </Form>
  );
}

    