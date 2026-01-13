import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking, useUpdateBookingStatus } from "@/hooks/useBookings";
import { useShowtimes } from "@/hooks/useShowtimes";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/hooks/useMovies";
import { Check, CreditCard, Loader2, Ticket } from "lucide-react";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  showtimeId: string;
  movie: Movie;
}

type Step = "seats" | "payment" | "confirmed";

const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;

const BookingModal = ({ isOpen, onClose, showtimeId, movie }: BookingModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const updateBookingStatus = useUpdateBookingStatus();
  
  const { data: showtimes } = useShowtimes(movie.id, format(new Date(), "yyyy-MM-dd"));
  const showtime = showtimes?.find((s) => s.id === showtimeId);

  const [step, setStep] = useState<Step>("seats");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Mock booked seats (in a real app, this would come from the database)
  const bookedSeats = ["A3", "A4", "B7", "B8", "C5", "D10", "E6", "F2", "G9"];

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;
    
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : prev.length < 10
        ? [...prev, seat]
        : prev
    );
  };

  const totalAmount = selectedSeats.length * (showtime?.price_standard || 0);

  const handleProceedToPayment = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to book tickets.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const booking = await createBooking.mutateAsync({
        showtime_id: showtimeId,
        movie_id: movie.id,
        theater_id: showtime?.theater_id || "",
        seats: selectedSeats,
        total_amount: totalAmount,
      });

      setBookingId(booking.id);
      setStep("payment");
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMockPayment = async () => {
    if (!bookingId) return;

    setIsProcessing(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await updateBookingStatus.mutateAsync({
        bookingId,
        status: "paid",
      });

      setStep("confirmed");

      // Mock email notification as toast
      toast({
        title: "📧 Booking Confirmed!",
        description: `Your e-ticket for ${movie.title} has been sent to your email.`,
      });
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep("seats");
    setSelectedSeats([]);
    setBookingId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === "seats" && "Select Your Seats"}
            {step === "payment" && "Complete Payment"}
            {step === "confirmed" && "Booking Confirmed!"}
          </DialogTitle>
        </DialogHeader>

        {step === "seats" && (
          <div className="space-y-6">
            {/* Movie Info */}
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
              <img
                src={movie.poster_url || ""}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-foreground">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {showtime?.theater?.name} • {showtime?.show_time?.slice(0, 5)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Screen */}
            <div className="text-center">
              <div className="w-3/4 mx-auto h-2 bg-primary/30 rounded-t-full mb-2" />
              <p className="text-xs text-muted-foreground">SCREEN</p>
            </div>

            {/* Seat Map */}
            <div className="flex flex-col items-center gap-2 py-4">
              {SEAT_ROWS.map((row) => (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-6 text-xs text-muted-foreground">{row}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                      const seat = `${row}${i + 1}`;
                      const isBooked = bookedSeats.includes(seat);
                      const isSelected = selectedSeats.includes(seat);

                      return (
                        <button
                          key={seat}
                          onClick={() => toggleSeat(seat)}
                          disabled={isBooked}
                          className={`w-6 h-6 text-xs rounded transition-all ${
                            isBooked
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground hover:bg-primary/50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded" />
                <span className="text-muted-foreground">Booked</span>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedSeats.length > 0
                    ? `${selectedSeats.length} seat(s): ${selectedSeats.sort().join(", ")}`
                    : "No seats selected"}
                </p>
                <p className="text-lg font-bold text-foreground">₹{totalAmount}</p>
              </div>
              <Button
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0 || isProcessing}
                className="glow-shadow"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Proceed to Pay"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="p-4 bg-secondary rounded-lg space-y-3">
              <h4 className="font-medium text-foreground">Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{movie.title}</span>
                <span className="text-foreground">{selectedSeats.length} ticket(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground">{selectedSeats.sort().join(", ")}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-bold text-foreground">₹{totalAmount}</span>
              </div>
            </div>

            {/* Mock Payment Button */}
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                🔒 This is a mock payment. Click below to simulate payment.
              </p>
              <Button
                onClick={handleMockPayment}
                disabled={isProcessing}
                className="w-full glow-shadow"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{totalAmount}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "confirmed" && (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-500" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Booking Successful!</h3>
              <p className="text-muted-foreground">
                Your tickets have been booked successfully.
              </p>
            </div>

            <div className="p-4 bg-secondary rounded-lg text-left space-y-2">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{movie.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {showtime?.theater?.name} • {showtime?.show_time?.slice(0, 5)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Seats: {selectedSeats.sort().join(", ")}</p>
                <p>Date: {format(new Date(), "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Book More
              </Button>
              <Button onClick={() => navigate("/bookings")} className="glow-shadow">
                View My Bookings
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
