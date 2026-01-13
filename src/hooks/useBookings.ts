import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Booking {
  id: string;
  user_id: string;
  showtime_id: string;
  movie_id: string;
  theater_id: string;
  seats: string[];
  total_amount: number;
  status: "pending" | "confirmed" | "paid" | "cancelled" | "expired";
  payment_id: string | null;
  booked_at: string;
  expires_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  showtime_id: string;
  movie_id: string;
  theater_id: string;
  seats: string[];
  total_amount: number;
}

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          movie:movies(*),
          theater:theaters(*),
          showtime:showtimes(*)
        `)
        .eq("user_id", user.id)
        .order("booked_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          ...data,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: Booking["status"] }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          payment_id: status === "paid" ? `PAY_${Date.now()}` : null,
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
