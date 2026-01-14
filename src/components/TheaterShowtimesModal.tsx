import { useEffect, useState } from "react";
import { X, MapPin, Clock, Armchair, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie, TheaterWithShowtimes, Showtime } from "@/types/movie";

interface TheaterShowtimesModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

const TheaterShowtimesModal = ({ movie, isOpen, onClose }: TheaterShowtimesModalProps) => {
  const [theaters, setTheaters] = useState<TheaterWithShowtimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Generate next 5 days for date selection
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
    };
  });

  useEffect(() => {
    if (isOpen) {
      fetchTheatersAndShowtimes();
    }
  }, [isOpen, movie.id, selectedDate]);

  const fetchTheatersAndShowtimes = async () => {
    setLoading(true);
    try {
      // Fetch theaters with their showtimes for this movie
      const { data: showtimesData, error: showtimesError } = await supabase
        .from('showtimes')
        .select(`
          *,
          theaters (*)
        `)
        .eq('movie_id', String(movie.id))
        .eq('show_date', selectedDate)
        .eq('is_available', true)
        .order('show_time', { ascending: true });

      if (showtimesError) throw showtimesError;

      // Group showtimes by theater
      const theaterMap = new Map<string, TheaterWithShowtimes>();
      
      showtimesData?.forEach((showtime: any) => {
        const theater = showtime.theaters;
        if (!theater) return;

        if (!theaterMap.has(theater.id)) {
          theaterMap.set(theater.id, {
            id: theater.id,
            name: theater.name,
            city: theater.city,
            address: theater.address,
            facilities: theater.facilities || [],
            showtimes: [],
          });
        }

        theaterMap.get(theater.id)?.showtimes.push({
          id: showtime.id,
          movie_id: showtime.movie_id,
          theater_id: showtime.theater_id,
          show_date: showtime.show_date,
          show_time: showtime.show_time,
          price_standard: showtime.price_standard,
          price_premium: showtime.price_premium,
          available_seats: showtime.available_seats,
        });
      });

      setTheaters(Array.from(theaterMap.values()));
    } catch (error) {
      console.error('Error fetching theaters:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-card rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Theaters Showing {movie.title}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Select a showtime to continue
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
          
          {/* Date Selection */}
          <div className="flex gap-2 px-4 md:px-6 pb-4 overflow-x-auto scrollbar-hide">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDate === date.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : theaters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No shows available for this date.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try selecting a different date.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {theaters.map((theater) => (
                <div
                  key={theater.id}
                  className="bg-muted/30 rounded-xl p-4 md:p-6 border border-border"
                >
                  {/* Theater Info */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {theater.name}
                      </h3>
                      {theater.address && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{theater.address}</span>
                        </div>
                      )}
                    </div>
                    {theater.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {theater.facilities.map((facility) => (
                          <span
                            key={facility}
                            className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Showtimes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {theater.showtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        className="group relative p-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="font-semibold text-foreground">
                            {formatTime(showtime.show_time)}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <IndianRupee className="w-3 h-3" />
                          <span>{showtime.price_standard}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs text-green-500 mt-1">
                          <Armchair className="w-3 h-3" />
                          <span>{showtime.available_seats} seats</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheaterShowtimesModal;
