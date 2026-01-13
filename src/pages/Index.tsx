import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import Footer from "@/components/Footer";
import { featuredMovie, nowShowingMovies, comingSoonMovies } from "@/data/movies";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 md:pt-32">
        <HeroSection movie={featuredMovie} />
        
        <MovieCarousel
          title="Now Showing"
          subtitle="Book tickets for movies currently in theatres"
          movies={nowShowingMovies}
        />
        
        <MovieCarousel
          title="Coming Soon"
          subtitle="Get notified when bookings open"
          movies={comingSoonMovies}
          showReleaseDate
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
