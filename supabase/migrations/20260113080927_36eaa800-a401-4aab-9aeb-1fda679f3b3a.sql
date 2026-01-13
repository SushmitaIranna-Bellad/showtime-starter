-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Mumbai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  banner_url TEXT,
  rating DECIMAL(3,1) DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  release_date DATE,
  genres TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  certificate TEXT,
  status TEXT DEFAULT 'now_showing' CHECK (status IN ('now_showing', 'coming_soon', 'ended')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create theaters table
CREATE TABLE public.theaters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  facilities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create showtimes table
CREATE TABLE public.showtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  theater_id UUID REFERENCES public.theaters(id) ON DELETE CASCADE NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price_standard DECIMAL(10,2) NOT NULL,
  price_premium DECIMAL(10,2),
  available_seats INTEGER DEFAULT 100,
  total_seats INTEGER DEFAULT 100,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'expired');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  showtime_id UUID REFERENCES public.showtimes(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  theater_id UUID REFERENCES public.theaters(id) ON DELETE CASCADE NOT NULL,
  seats TEXT[] NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_id TEXT,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_languages TEXT[] DEFAULT '{}',
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_city TEXT DEFAULT 'Mumbai',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create movie notifications table
CREATE TABLE public.movie_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS on all tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for movies, theaters, showtimes
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Anyone can view theaters" ON public.theaters FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Anyone can view showtimes" ON public.showtimes FOR SELECT TO anon, authenticated USING (TRUE);

-- Admin can manage movies
CREATE POLICY "Admins can manage movies" ON public.movies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Movie notifications policies
CREATE POLICY "Users can view their notifications" ON public.movie_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create notifications" ON public.movie_notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their notifications" ON public.movie_notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_movies_status ON public.movies(status);
CREATE INDEX idx_movies_featured ON public.movies(is_featured);
CREATE INDEX idx_showtimes_movie ON public.showtimes(movie_id);
CREATE INDEX idx_showtimes_date ON public.showtimes(show_date);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);