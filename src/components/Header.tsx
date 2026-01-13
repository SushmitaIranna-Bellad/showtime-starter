import { Search, Menu, MapPin, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center glow-shadow">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-foreground">
              Book<span className="text-primary">My</span>Show
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for Movies, Events, Plays..."
                className="w-full pl-12 pr-4 py-3 bg-secondary border-border rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Mumbai</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{profile?.full_name || "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 pb-3 border-t border-border/50 pt-3">
          <a href="#" className="text-sm font-medium text-primary">Movies</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Stream</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Events</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
