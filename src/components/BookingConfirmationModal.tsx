import { useState } from "react";
import { X, IndianRupee, Ticket, MapPin, Clock, Calendar, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { Movie, Showtime, Theater } from "@/types/movie";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingConfirmationModalProps {
  movie: Movie;
  showtime: Showtime;
  theater: Theater;
  selectedSeats: string[];
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type BookingStep = "summary" | "payment" | "success";

const BookingConfirmationModal = ({
  movie,
  showtime,
  theater,
  selectedSeats,
  totalAmount,
  isOpen,
  onClose,
  onSuccess,
}: BookingConfirmationModalProps) => {
  const [step, setStep] = useState<BookingStep>("summary");
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleProceedToPayment = async () => {
    if (!user) {
      toast.error("Please sign in to complete your booking");
      navigate("/login");
      return;
    }

    setStep("payment");
    setProcessing(true);

    try {
      // Create booking with pending status
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          movie_id: String(movie.id),
          theater_id: theater.id,
          showtime_id: showtime.id,
          seats: selectedSeats,
          total_amount: totalAmount,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Simulate payment processing (mock payment)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update booking status to paid
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "paid",
          payment_id: `MOCK_PAY_${Date.now()}`,
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // Update available seats in showtime
      const { error: seatsError } = await supabase
        .from("showtimes")
        .update({
          available_seats: showtime.available_seats - selectedSeats.length,
        })
        .eq("id", showtime.id);

      if (seatsError) throw seatsError;

      // Mock email notification - show toast instead
      toast.success(
        `🎉 Booking Confirmed! Confirmation email sent to ${user.email}. Booking ID: ${booking.id.slice(0, 8).toUpperCase()}`,
        { duration: 6000 }
      );

      setStep("success");
      setProcessing(false);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to complete booking");
      setStep("summary");
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      onSuccess();
    }
    setStep("summary");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={step !== "payment" ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : step === "payment" ? (
                <CreditCard className="w-6 h-6 text-primary" />
              ) : (
                <Ticket className="w-6 h-6 text-primary" />
              )}
              <h2 className="text-xl font-bold text-foreground">
                {step === "success"
                  ? "Booking Confirmed!"
                  : step === "payment"
                  ? "Processing Payment"
                  : "Confirm Booking"}
              </h2>
            </div>
            {step !== "payment" && (
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {step === "payment" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-foreground font-medium">Processing your payment...</p>
              <p className="text-muted-foreground text-sm">Please wait, do not close this window</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-foreground font-medium text-lg mb-2">Payment Successful!</p>
              <p className="text-muted-foreground text-center">
                Your tickets have been booked. Check your email for confirmation details.
              </p>
            </div>
          )}

          {(step === "summary" || step === "success") && (
            <>
              {/* Movie Details */}
              <div className="flex gap-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-24 h-36 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{movie.title}</h3>
                  <p className="text-muted-foreground text-sm">{movie.genres.join(", ")}</p>
                  <p className="text-muted-foreground text-sm">{movie.language}</p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-foreground font-medium">{theater.name}</p>
                    {theater.address && (
                      <p className="text-muted-foreground text-sm">{theater.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <p className="text-foreground">{formatDate(showtime.show_date)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <p className="text-foreground">{formatTime(showtime.show_time)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-primary" />
                  <p className="text-foreground">
                    Seats: <span className="font-semibold">{selectedSeats.join(", ")}</span>
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-foreground font-medium">Total Amount</span>
                <div className="flex items-center gap-1 text-primary">
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-2xl font-bold">{totalAmount}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {step === "summary" && (
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 md:p-6">
            <button
              onClick={handleProceedToPayment}
              className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay ₹{totalAmount}
            </button>
            <p className="text-center text-muted-foreground text-xs mt-3">
              By proceeding, you agree to our terms and conditions
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 md:p-6">
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
