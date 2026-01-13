import { Play, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Movie } from "@/hooks/useMovies";

interface HeroSectionProps {
  movie: Movie;
}

const HeroSection = ({ movie }: HeroSectionProps) => {
  const navigate = useNavigate();

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatVotes = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={movie.banner_url || movie.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80"}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-end pb-16 md:pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Featured Today</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-gradient leading-tight">
            {movie.title}
          </h1>

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
            {movie.languages?.[0] && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{movie.languages[0]}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres?.map((genre) => (
              <span key={genre} className="px-3 py-1 text-sm rounded-full border border-border text-muted-foreground">
                {genre}
              </span>
            ))}
          </div>

          {movie.description && (
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl">{movie.description}</p>
          )}

          <div className="flex flex-wrap gap-4">
            {movie.id && (
              <Button size="lg" className="gap-2 glow-shadow" onClick={() => navigate(`/movie/${movie.id}`)}>
                <Play className="w-5 h-5 fill-current" />
                Book Tickets
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
