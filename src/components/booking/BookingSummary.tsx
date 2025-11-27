"use client";

import { Event, TicketType } from "@/types";
import { formatCurrency } from "@/lib/currency-utils";
import { APP_CONFIG } from "@/constants/config";
import { Calendar, MapPin, Ticket, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface BookingSummaryProps {
  event: Event;
  selectedTickets: { [key: string]: number };
  onProceed: () => void;
}

export default function BookingSummary({
  event,
  selectedTickets,
  onProceed,
}: BookingSummaryProps) {
  const calculateTotal = () => {
    let total = 0;
    let ticketCount = 0;

    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      const ticket = event.ticketTypes.find((t) => t.id === ticketId);
      if (ticket && quantity > 0) {
        total += ticket.price * quantity;
        ticketCount += quantity;
      }
    });

    return { total, ticketCount };
  };

  const { total, ticketCount } = calculateTotal();
  const hasSelectedTickets = ticketCount > 0;

  // Platform fee (configurable)
  const platformFee = total * (APP_CONFIG.platformCommission / 100);
  const gst = (total + platformFee) * (APP_CONFIG.gstPercentage / 100);
  const finalTotal = total + platformFee + gst;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h3>

      {/* Event Details */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">{event.title}</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.dateTime.start), "PPP")}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.venue.name}, {event.venue.city}</span>
          </div>
        </div>
      </div>

      {/* Selected Tickets */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Ticket className="w-4 h-4 mr-2" />
          Selected Tickets
        </h4>

        {hasSelectedTickets ? (
          <div className="space-y-3">
            {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
              const ticket = event.ticketTypes.find((t) => t.id === ticketId);
              if (!ticket || quantity === 0) return null;

              return (
                <div key={ticketId} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{ticket.name}</p>
                    <p className="text-gray-600">x {quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(ticket.price * quantity)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tickets selected</p>
        )}
      </div>

      {/* Price Breakdown */}
      {hasSelectedTickets && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform Fee ({APP_CONFIG.platformCommission}%)</span>
            <span className="font-semibold text-gray-900">{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST ({APP_CONFIG.gstPercentage}%)</span>
            <span className="font-semibold text-gray-900">{formatCurrency(gst)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="font-bold text-2xl text-purple-600">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <button
        onClick={onProceed}
        disabled={!hasSelectedTickets}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        <CreditCard className="w-5 h-5" />
        <span>Proceed to Payment</span>
      </button>

      {!hasSelectedTickets && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Please select at least one ticket to proceed
        </p>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          🔒 Your payment information is secure and encrypted. All tickets will be sent to your registered email.
        </p>
      </div>
    </div>
  );
}