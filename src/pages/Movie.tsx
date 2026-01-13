import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMovie } from "@/hooks/useMovies";
import { useShowtimes } from "@/hooks/useShowtimes";
import { format } from "date-fns";
import { useState } from "react";
import BookingModal from "@/components/BookingModal";

const Movie = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: movie, isLoading: movieLoading } = useMovie(id || "");
  const { data: showtimes, isLoading: showtimesLoading } = useShowtimes(id || "", format(new Date(), "yyyy-MM-dd"));
  
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Movie not found</h1>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatVotes = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  // Group showtimes by theater
  const showtimesByTheater = showtimes?.reduce((acc, showtime) => {
    const theaterId = showtime.theater_id;
    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater: showtime.theater,
        showtimes: [],
      };
    }
    acc[theaterId].showtimes.push(showtime);
    return acc;
  }, {} as Record<string, { theater: any; showtimes: typeof showtimes }>);

  const handleBookNow = (showtimeId: string) => {
    setSelectedShowtime(showtimeId);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img
          src={movie.banner_url || movie.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80"}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 glass-effect px-4 py-2 rounded-full text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {movie.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  <span className="font-semibold text-foreground">{movie.rating}/10</span>
                  <span className="text-muted-foreground text-sm">({formatVotes(movie.votes_count)} votes)</span>
                </div>
              )}
              {movie.duration_minutes && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatDuration(movie.duration_minutes)}</span>
                </div>
              )}
              {movie.certificate && (
                <span className="px-2 py-1 text-xs font-medium border border-border rounded text-muted-foreground">
                  {movie.certificate}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <span key={genre} className="px-3 py-1 text-sm rounded-full border border-border text-muted-foreground">
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-muted-foreground max-w-2xl">{movie.description}</p>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Showtimes</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{format(new Date(), "EEEE, MMMM d")}</span>
          </div>
        </div>

        {showtimesLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading showtimes...</div>
        ) : !showtimesByTheater || Object.keys(showtimesByTheater).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No showtimes available for today</p>
            <Button variant="outline" onClick={() => navigate("/")}>Browse other movies</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(showtimesByTheater).map(([theaterId, { theater, showtimes }]) => (
              <div key={theaterId} className="glass-effect rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{theater?.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{theater?.address}</span>
                    </div>
                  </div>
                  {theater?.facilities && theater.facilities.length > 0 && (
                    <div className="flex gap-2">
                      {theater.facilities.slice(0, 3).map((facility: string) => (
                        <span
                          key={facility}
                          className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {showtimes?.map((showtime) => (
                    <button
                      key={showtime.id}
                      onClick={() => handleBookNow(showtime.id)}
                      disabled={showtime.available_seats === 0}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        showtime.available_seats === 0
                          ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
                          : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      <div>{showtime.show_time.slice(0, 5)}</div>
                      <div className="text-xs mt-1 opacity-70">
                        ₹{showtime.price_standard}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedShowtime && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedShowtime(null);
          }}
          showtimeId={selectedShowtime}
          movie={movie}
        />
      )}
    </div>
  );
};

export default Movie;
