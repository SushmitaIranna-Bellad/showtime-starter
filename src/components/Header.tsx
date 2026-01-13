import { Search, Menu, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center glow-shadow">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-foreground">
              Book<span className="text-primary">My</span>Show
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports..."
                className="w-full pl-12 pr-4 py-3 bg-secondary border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Location - Desktop */}
            <button className="hidden md:flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Mumbai</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Sign In Button */}
            <Button variant="default" size="sm" className="hidden sm:flex">
              Sign In
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies, events..."
              className="w-full pl-12 pr-4 py-2 bg-secondary border-border rounded-lg text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 pb-3 border-t border-border/50 pt-3">
          <a href="#" className="text-sm font-medium text-primary">Movies</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Stream</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Events</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Plays</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sports</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Activities</a>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t border-border">
          <nav className="flex flex-col p-4 gap-3">
            <a href="#" className="text-sm font-medium text-primary py-2">Movies</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">Stream</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">Events</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">Plays</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">Sports</a>
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Mumbai</span>
            </div>
            <Button variant="default" size="sm" className="mt-2">
              Sign In
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
