import { useState } from "react";
import { Star, Calendar } from "lucide-react";
import { Movie } from "@/types/movie";
import TheaterShowtimesModal from "./TheaterShowtimesModal";

interface MovieCardProps {
  movie: Movie;
  showReleaseDate?: boolean;
}

const MovieCard = ({ movie, showReleaseDate = false }: MovieCardProps) => {
  const [showTheaters, setShowTheaters] = useState(false);

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showReleaseDate) {
      setShowTheaters(true);
    }
  };

  return (
    <>
      <div className="group cursor-pointer hover-lift">
        {/* Poster Container */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden card-shadow">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          {movie.rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md glass-effect">
              <Star className="w-3 h-3 text-accent fill-accent" />
              <span className="text-xs font-semibold text-foreground">{movie.rating}</span>
            </div>
          )}

          {/* Release Date Badge */}
          {showReleaseDate && movie.releaseDate && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-primary">
              <Calendar className="w-3 h-3 text-primary-foreground" />
              <span className="text-xs font-semibold text-primary-foreground">{movie.releaseDate}</span>
            </div>
          )}

          {/* Quick Book Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button 
              onClick={handleBookNow}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              {showReleaseDate ? "Notify Me" : "Book Now"}
            </button>
          </div>
        </div>

        {/* Movie Info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{movie.language}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="truncate">{movie.genres.slice(0, 2).join(", ")}</span>
          </div>
          {movie.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-accent font-medium">{movie.votes}</span>
              <span className="text-muted-foreground">votes</span>
            </div>
          )}
        </div>
      </div>

      <TheaterShowtimesModal
        movie={movie}
        isOpen={showTheaters}
        onClose={() => setShowTheaters(false)}
      />
    </>
  );
};

export default MovieCard;
