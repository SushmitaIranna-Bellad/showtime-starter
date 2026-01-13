import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/hooks/useMovies";

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  showReleaseDate?: boolean;
  isLoading?: boolean;
}

const MovieCarousel = ({ title, subtitle, movies, showReleaseDate = false, isLoading = false }: MovieCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{title}</h2>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-[160px] md:w-[200px]">
                <div className="aspect-[2/3] bg-secondary rounded-xl animate-pulse" />
                <div className="mt-3 h-4 bg-secondary rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scroll("left")} className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[160px] md:w-[200px] lg:w-[220px]">
              <MovieCard movie={movie} showReleaseDate={showReleaseDate} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieCarousel;
