import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { calculateBookingPrice } from "@/lib/gst-calculator";
import { generateBookingNumber } from "@/lib/utils";

interface SelectedTicket {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
}

export function useBooking() {
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const createBookingMutation = useMutation(api.bookings.createBooking);
  const createPaymentMutation = useMutation(api.payments.createPayment);

  const addTicket = (ticket: SelectedTicket) => {
    setSelectedTickets((prev) => {
      const existing = prev.find((t) => t.ticketTypeId === ticket.ticketTypeId);
      if (existing) {
        return prev.map((t) =>
          t.ticketTypeId === ticket.ticketTypeId
            ? { ...t, quantity: t.quantity + ticket.quantity }
            : t
        );
      }
      return [...prev, ticket];
    });
  };

  const updateTicketQuantity = (ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeTicket(ticketTypeId);
      return;
    }
    
    setSelectedTickets((prev) =>
      prev.map((t) =>
        t.ticketTypeId === ticketTypeId ? { ...t, quantity } : t
      )
    );
  };

  const removeTicket = (ticketTypeId: string) => {
    setSelectedTickets((prev) =>
      prev.filter((t) => t.ticketTypeId !== ticketTypeId)
    );
  };

  const clearTickets = () => {
    setSelectedTickets([]);
  };

  const getTotalTickets = () => {
    return selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const getPricing = () => {
    return calculateBookingPrice(selectedTickets);
  };

  const createBooking = async (
    eventId: Id<"events">,
    userId: Id<"users"> | undefined,
    guestDetails: { name: string; email: string; phone: string } | undefined,
    paymentId: Id<"payments">,
    qrCode?: string
  ) => {
    setIsProcessing(true);
    try {
      const pricing = getPricing();
      const bookingNumber = generateBookingNumber();

      const bookingId = await createBookingMutation({
        bookingNumber,
        eventId,
        userId,
        guestDetails,
        tickets: selectedTickets,
        totalAmount: pricing.totalPrice,
        pricing: {
          subtotal: pricing.subtotal,
          gst: pricing.gst,
          platformFee: pricing.platformFee,
          total: pricing.totalPrice,
        },
        paymentId,
        qrCode,
      });

      clearTickets();
      return { bookingId, bookingNumber };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedTickets,
    isProcessing,
    addTicket,
    updateTicketQuantity,
    removeTicket,
    clearTickets,
    getTotalTickets,
    getPricing,
    createBooking,
  };
}