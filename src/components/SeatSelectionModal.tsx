import { useState, useEffect } from "react";
import { X, IndianRupee, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie, Showtime, Theater } from "@/types/movie";
import BookingConfirmationModal from "./BookingConfirmationModal";

interface SeatSelectionModalProps {
  movie: Movie;
  showtime: Showtime;
  theater: Theater;
  ticketCount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSeats: string[]) => void;
}

const SeatSelectionModal = ({
  movie,
  showtime,
  theater,
  ticketCount,
  isOpen,
  onClose,
  onConfirm,
}: SeatSelectionModalProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);

  // Theater layout configuration
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = 12;
  const premiumRows = ["A", "B", "C"]; // First 3 rows are premium

  useEffect(() => {
    if (isOpen) {
      fetchBookedSeats();
      setSelectedSeats([]);
    }
  }, [isOpen, showtime.id]);

  const fetchBookedSeats = async () => {
    setLoading(true);
    try {
      // Fetch booked seats for this showtime
      const { data, error } = await supabase
        .from("bookings")
        .select("seats")
        .eq("showtime_id", showtime.id)
        .in("status", ["pending", "confirmed", "paid"]);

      if (error) throw error;

      // Flatten all booked seats
      const allBookedSeats = data?.flatMap((booking) => booking.seats) || [];
      setBookedSeats(allBookedSeats);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= ticketCount) {
        // Replace the first selected seat with the new one
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  };

  const getSeatPrice = (seatId: string) => {
    const row = seatId.charAt(0);
    return premiumRows.includes(row) && showtime.price_premium
      ? showtime.price_premium
      : showtime.price_standard;
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId), 0);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleProceedToBooking = () => {
    setShowBookingConfirmation(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingConfirmation(false);
    onConfirm(selectedSeats);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-5xl max-h-[95vh] mx-4 bg-card rounded-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Select Your Seats
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {movie.title} • {theater.name} • {formatTime(showtime.show_time)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Ticket Selection Info */}
            <div className="flex items-center gap-2 mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">
                Select {ticketCount} seat{ticketCount > 1 ? "s" : ""} • 
                Selected: {selectedSeats.length}/{ticketCount}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Screen */}
                <div className="relative">
                  <div className="w-3/4 mx-auto h-2 bg-gradient-to-t from-primary/50 to-primary rounded-t-full" />
                  <div className="w-3/4 mx-auto h-8 bg-gradient-to-b from-primary/20 to-transparent" />
                  <p className="text-center text-sm text-muted-foreground -mt-2 mb-4">
                    SCREEN
                  </p>
                </div>

                {/* Seat Legend */}
                <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-green-500 bg-transparent" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-500" />
                    <span className="text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary border-2 border-primary" />
                    <span className="text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-yellow-500 bg-transparent" />
                    <span className="text-muted-foreground">Premium</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-max mx-auto">
                    {rows.map((row) => (
                      <div key={row} className="flex items-center gap-2 mb-2">
                        {/* Row Label */}
                        <span className="w-6 text-center font-semibold text-muted-foreground">
                          {row}
                        </span>

                        {/* Seats */}
                        <div className="flex gap-1">
                          {Array.from({ length: seatsPerRow }, (_, index) => {
                            const seatNumber = index + 1;
                            const seatId = `${row}${seatNumber}`;
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            const isPremium = premiumRows.includes(row);

                            // Add aisle gap after seat 6
                            const hasAisle = index === 5;

                            return (
                              <div key={seatId} className="flex items-center">
                                <button
                                  disabled={isBooked}
                                  onClick={() => handleSeatClick(seatId)}
                                  className={`
                                    w-8 h-8 rounded text-xs font-medium transition-all
                                    flex items-center justify-center
                                    ${isBooked 
                                      ? "bg-gray-500 cursor-not-allowed text-gray-300" 
                                      : isSelected
                                      ? "bg-primary border-2 border-primary text-primary-foreground scale-110"
                                      : isPremium
                                      ? "border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"
                                      : "border-2 border-green-500 text-green-500 hover:bg-green-500/20"
                                    }
                                  `}
                                >
                                  {seatNumber}
                                </button>
                                {hasAisle && <div className="w-6" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Row Label */}
                        <span className="w-6 text-center font-semibold text-muted-foreground">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="flex items-center justify-center gap-8 text-sm border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Standard:</span>
                    <div className="flex items-center gap-1 text-foreground font-semibold">
                      <IndianRupee className="w-3 h-3" />
                      <span>{showtime.price_standard}</span>
                    </div>
                  </div>
                  {showtime.price_premium && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Premium:</span>
                      <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <IndianRupee className="w-3 h-3" />
                        <span>{showtime.price_premium}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedSeats.join(", ") || "None"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-lg font-bold text-foreground">Total:</span>
                  <IndianRupee className="w-4 h-4 text-primary" />
                  <span className="text-lg font-bold text-primary">
                    {calculateTotal()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleProceedToBooking}
                disabled={selectedSeats.length !== ticketCount}
                className={`
                  px-8 py-3 rounded-lg font-semibold transition-all
                  ${selectedSeats.length === ticketCount
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                  }
                `}
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        movie={movie}
        showtime={showtime}
        theater={theater}
        selectedSeats={selectedSeats}
        totalAmount={calculateTotal()}
        isOpen={showBookingConfirmation}
        onClose={() => setShowBookingConfirmation(false)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default SeatSelectionModal;
