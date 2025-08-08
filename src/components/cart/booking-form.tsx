
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
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Phone, User, MessageSquareText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { useState, useEffect } from "react"; // Import useEffect
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/contexts/auth-context";

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).regex(/^\+?[0-9\s-()]*$/, "Invalid phone number format."),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }).min(new Date(new Date().setDate(new Date().getDate() -1)), "Travel date cannot be in the past."),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingForm() {
  const { toast } = useToast();
  const { cartItems, totalCost, clearCart } = useCart();
  const { user, openAuthModal, setPostLoginAction } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      const defaultName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
      if (defaultName) {
        form.setValue('name', defaultName);
      }
      if (user.phone) {
         form.setValue('phone', user.phone);
      }
    } else {
      // Clear form if user logs out or no user
      form.reset({ name: "", phone: "", travelDate: undefined });
    }
  }, [user, form]);


  async function onSubmit(data: BookingFormValues) {
    if (!user) {
      // This should ideally not be reached if button click logic is correct
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      openAuthModal('signIn');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before booking.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        travel_date: format(data.travelDate, "yyyy-MM-dd"),
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency
        })),
        total_cost: totalCost,
        currency: cartItems[0]?.currency || 'AED',
        status: 'pending', // Explicitly set status to pending
      };

      const { error: supabaseError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (supabaseError) {
        throw supabaseError;
      }

      const pabblyWebhookUrlBase = "https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTZiMDYzNDA0M2M1MjY5NTUzMTUxMzYi_pc";
      const bookedItemsSummary = bookingData.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
      const params = new URLSearchParams({
        name: bookingData.name,
        phone: bookingData.phone,
        travelDate: bookingData.travel_date,
        totalCost: bookingData.total_cost.toFixed(2),
        currency: bookingData.currency,
        bookedItems: bookedItemsSummary,
        status: bookingData.status, // Also send status to Pabbly
      });
      const pabblyWebhookUrl = `${pabblyWebhookUrlBase}?${params.toString()}`;

      try {
        const webhookResponse = await fetch(pabblyWebhookUrl);
        if (!webhookResponse.ok) {
          console.error("Pabbly Webhook Error:", webhookResponse.status, await webhookResponse.text());
        } else {
          console.log("Data sent to Pabbly Webhook successfully.");
        }
      } catch (webhookError) {
        console.error("Error sending data to Pabbly Webhook:", webhookError);
      }

      toast({
        title: "Booking Confirmed!",
        description: `Thank you, ${data.name}. Your booking for ${format(data.travelDate, "PPP")} has been confirmed with status: pending.`,
        duration: 7000,
      });

      clearCart();
      // Reset form fields to initial state or pre-filled if user is still logged in
      if (user) {
        const defaultName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
        form.reset({
            name: defaultName || "",
            phone: user.phone || "",
            travelDate: undefined // Clear travel date
        });
      } else {
        form.reset({ name: "", phone: "", travelDate: undefined });
      }


    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Could not submit your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleConfirmBookingClick = () => {
    if (!user) {
       toast({
        title: "Authentication Required",
        description: "Please log in or sign up to complete your booking.",
        variant: "default",
        duration: 5000,
      });
      setPostLoginAction(() => () => {
        toast({
          title: "Logged In!",
          description: "You can now attempt your booking again.",
        });
        // Pre-fill form after login if possible
        const defaultName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim();
        if (defaultName) form.setValue('name', defaultName);
        if (user?.phone) form.setValue('phone', user.phone);
      });
      openAuthModal('signIn');
      return;
    }
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); handleConfirmBookingClick(); }} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="e.g. John Doe" {...field} className="pl-10" disabled={isSubmitting} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (with country code)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="e.g. +971 50 123 4567" {...field} className="pl-10" disabled={isSubmitting} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="travelDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Travel Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isSubmitting || cartItems.length === 0}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <MessageSquareText className="mr-2 h-5 w-5" />
          )}
          {isSubmitting ? "Processing..." : "Confirm Booking"}
        </Button>
      </form>
    </Form>
  );
}
