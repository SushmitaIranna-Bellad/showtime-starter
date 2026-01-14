export interface Movie {
  id: number | string;
  title: string;
  poster: string;
  rating: number;
  votes: string;
  genres: string[];
  language: string;
  releaseDate?: string;
  duration?: string;
  description?: string;
  status?: 'now_showing' | 'coming_soon';
}

export interface Theater {
  id: string;
  name: string;
  city: string;
  address: string | null;
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
}

export interface TheaterWithShowtimes extends Theater {
  showtimes: Showtime[];
}
