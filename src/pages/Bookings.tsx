import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Film, ArrowLeft, Ticket, Calendar, Clock, MapPin, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface BookingWithDetails {
  id: string;
  seats: string[];
  total_amount: number;
  status: string;
  booked_at: string;
  movie: {
    title: string;
    poster_url: string;
  };
  theater: {
    name: string;
    address: string;
  };
  showtime: {
    show_date: string;
    show_time: string;
  };
}

const Bookings = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          seats,
          total_amount,
          status,
          booked_at,
          movies (title, poster_url),
          theaters (name, address),
          showtimes (show_date, show_time)
        `)
        .eq("user_id", user!.id)
        .order("booked_at", { ascending: false });

      if (error) throw error;

      const formattedBookings = data?.map((b: any) => ({
        id: b.id,
        seats: b.seats,
        total_amount: b.total_amount,
        status: b.status,
        booked_at: b.booked_at,
        movie: {
          title: b.movies?.title || "Unknown Movie",
          poster_url: b.movies?.poster_url || "/placeholder.svg",
        },
        theater: {
          name: b.theaters?.name || "Unknown Theater",
          address: b.theaters?.address || "",
        },
        showtime: {
          show_date: b.showtimes?.show_date || "",
          show_time: b.showtimes?.show_time || "",
        },
      })) || [];

      setBookings(formattedBookings);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-500";
      case "confirmed":
        return "bg-blue-500/20 text-blue-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "cancelled":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">My Bookings</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h2>
            <p className="text-muted-foreground mb-6">Start by booking your favorite movies!</p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Movie Poster */}
                  <div className="md:w-40 h-40 md:h-auto flex-shrink-0">
                    <img
                      src={booking.movie.poster_url}
                      alt={booking.movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {booking.movie.title}
                        </h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <IndianRupee className="w-4 h-4" />
                        <span className="font-bold">{booking.total_amount}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{booking.theater.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{formatDate(booking.showtime.show_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{formatTime(booking.showtime.show_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">Seats: {booking.seats.join(", ")}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Booked on {new Date(booking.booked_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
