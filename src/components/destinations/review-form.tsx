
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import StarRatingInput from "@/components/shared/star-rating-input";
import type { Review } from "@/types";

const reviewFormSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating." }).max(5),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters.").optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  destinationId: string;
  onReviewSubmitted: (newReview: Review) => void;
}

export default function ReviewForm({ destinationId, onReviewSubmitted }: ReviewFormProps) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  async function onSubmit(values: ReviewFormValues) {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to submit a review.",
        variant: "destructive"
      });
      openAuthModal('signIn');
      return;
    }
    setIsSubmitting(true);
    try {
      const reviewData = {
        destination_id: destinationId,
        user_id: user.id,
        rating: values.rating,
        comment: values.comment,
        user_name: `${user.user_metadata.first_name || 'Anonymous'} ${user.user_metadata.last_name || ''}`.trim(),
      };
      
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
        
      if (error) throw error;

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      
      onReviewSubmitted(data as Review);
      form.reset({ rating: 0, comment: '' });

    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Could not submit your review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
        <div className="text-center p-4 border-2 border-dashed rounded-lg">
            <p className="mb-2 text-muted-foreground">You must be logged in to leave a review.</p>
            <Button onClick={() => openAuthModal('signIn')}>Login to Review</Button>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <StarRatingInput
                  rating={field.value}
                  onRatingChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}
