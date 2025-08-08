
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AiItinerarySuggestionsInput } from '@/ai/flows/ai-itinerary-suggestions';
import { Loader2, Wand2 } from "lucide-react";

interface ItineraryFormProps {
  onSubmit: (data: AiItinerarySuggestionsInput) => Promise<void>;
  isLoading: boolean;
}

const budgetOptions = [
  { value: "low", label: "Budget-friendly" },
  { value: "medium", label: "Mid-range" },
  { value: "high", label: "Luxury" },
];

const itineraryFormSchema = z.object({
  interests: z.string().min(3, { message: "Please describe your interests (e.g., adventure, luxury, cultural)." }),
  duration: z.string()
    .min(1, { message: "Trip duration is required."})
    .regex(/^\d+$/, { message: "Duration must be a whole number of days."})
    .transform(Number)
    .pipe(z.number()
      .int({ message: "Duration must be a whole number of days." })
      .min(1, { message: "Trip duration must be at least 1 day." })
      .max(30, { message: "Trip duration cannot exceed 30 days." })
    ),
  budget: z.enum(["low", "medium", "high"], { required_error: "Please select your budget." }),
});


export default function ItineraryForm({ onSubmit, isLoading }: ItineraryFormProps) {
  const form = useForm<z.infer<typeof itineraryFormSchema>>({
    resolver: zodResolver(itineraryFormSchema),
    defaultValues: {
      interests: "",
      duration: "3", // Default duration as string
      budget: "medium",
    },
  });

  const handleFormSubmit = (values: z.infer<typeof itineraryFormSchema>) => {
    const apiInput: AiItinerarySuggestionsInput = {
      ...values,
      duration: String(values.duration), // Convert duration back to string for AI function (values.duration is number here)
    };
    onSubmit(apiInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Travel Interests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., adventure, luxury, cultural, desert, relaxation, family fun"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List your interests, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Duration (days)</FormLabel>
                <FormControl>
                  {/* Pass e.target.value (string) to field.onChange */}
                  <Input type="number" placeholder="e.g., 3" {...field} onChange={e => field.onChange(e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {budgetOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full text-lg py-3">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          Generate Itinerary
        </Button>
      </form>
    </Form>
  );
}
