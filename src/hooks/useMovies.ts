import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  banner_url: string | null;
  rating: number;
  votes_count: number;
  duration_minutes: number | null;
  release_date: string | null;
  genres: string[];
  languages: string[];
  certificate: string | null;
  status: string;
  is_featured: boolean;
}

export const useMovies = (status?: string) => {
  return useQuery({
    queryKey: ["movies", status],
    queryFn: async () => {
      let query = supabase.from("movies").select("*");
      
      if (status) {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useFeaturedMovie = () => {
  return useQuery({
    queryKey: ["featured-movie"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("is_featured", true)
        .eq("status", "now_showing")
        .maybeSingle();
      
      if (error) throw error;
      return data as Movie | null;
    },
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Movie | null;
    },
    enabled: !!id,
  });
};
