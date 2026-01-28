import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { User, LogOut, Ticket, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const UserMenu = () => {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
          {user.user_metadata?.full_name || user.email?.split("@")[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg border border-border shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <div className="p-1">
              <Link
                to="/bookings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
