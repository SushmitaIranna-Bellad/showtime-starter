import { useState } from "react";
import { Play, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types/movie";
import TheaterShowtimesModal from "./TheaterShowtimesModal";

interface HeroSectionProps {
  movie: Movie;
}

const HeroSection = ({ movie }: HeroSectionProps) => {
  const [showTheaters, setShowTheaters] = useState(false);

  return (
    <>
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex items-end pb-16 md:pb-24">
          <div className="max-w-2xl">
            {/* Featured Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">Featured Today</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-gradient leading-tight">
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span className="font-semibold text-foreground">{movie.rating}/10</span>
                <span className="text-muted-foreground text-sm">({movie.votes} votes)</span>
              </div>
              {movie.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{movie.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{movie.language}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 text-sm rounded-full border border-border text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            {movie.description && (
              <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl">
                {movie.description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="gap-2 glow-shadow"
                onClick={() => setShowTheaters(true)}
              >
                <Play className="w-5 h-5 fill-current" />
                Book Tickets
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <TheaterShowtimesModal
        movie={movie}
        isOpen={showTheaters}
        onClose={() => setShowTheaters(false)}
      />
    </>
  );
};

export default HeroSection;
