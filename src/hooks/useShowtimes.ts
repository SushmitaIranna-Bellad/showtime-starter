import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Theater {
  id: string;
  name: string;
  address: string | null;
  city: string;
  facilities: string[];
}

export interface Showtime {
  id: string;
  movie_id: string;
  theater_id: string;
  show_date: string;
  show_time: string;
  price_standard: number;
  price_premium: number | null;
  available_seats: number;
  total_seats: number;
  is_available: boolean;
  theater?: Theater;
}

export const useShowtimes = (movieId: string, date?: string) => {
  return useQuery({
    queryKey: ["showtimes", movieId, date],
    queryFn: async () => {
      let query = supabase
        .from("showtimes")
        .select(`
          *,
          theater:theaters(*)
        `)
        .eq("movie_id", movieId)
        .eq("is_available", true);
      
      if (date) {
        query = query.eq("show_date", date);
      }
      
      const { data, error } = await query.order("show_time", { ascending: true });
      
      if (error) throw error;
      return data as Showtime[];
    },
    enabled: !!movieId,
  });
};

export const useTheaters = () => {
  return useQuery({
    queryKey: ["theaters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theaters")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Theater[];
    },
  });
};
