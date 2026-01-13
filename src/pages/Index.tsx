import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import Footer from "@/components/Footer";
import { useMovies, useFeaturedMovie } from "@/hooks/useMovies";

const Index = () => {
  const { data: featuredMovie } = useFeaturedMovie();
  const { data: nowShowingMovies, isLoading: nowShowingLoading } = useMovies("now_showing");
  const { data: comingSoonMovies, isLoading: comingSoonLoading } = useMovies("coming_soon");

  const defaultFeatured = {
    id: "",
    title: "Welcome to BookMyShow",
    description: "Book your favorite movies, events, and shows with ease.",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
    banner_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
    rating: 0,
    votes_count: 0,
    duration_minutes: null,
    release_date: null,
    genres: ["Entertainment"],
    languages: ["All"],
    certificate: null,
    status: "now_showing",
    is_featured: true,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 md:pt-32">
        <HeroSection movie={featuredMovie || defaultFeatured} />
        
        <MovieCarousel
          title="Now Showing"
          subtitle="Book tickets for movies currently in theatres"
          movies={nowShowingMovies || []}
          isLoading={nowShowingLoading}
        />
        
        <MovieCarousel
          title="Coming Soon"
          subtitle="Get notified when bookings open"
          movies={comingSoonMovies || []}
          showReleaseDate
          isLoading={comingSoonLoading}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
