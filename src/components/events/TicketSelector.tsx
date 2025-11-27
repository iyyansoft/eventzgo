"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
}

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  selectedTickets: { [key: string]: number };
  onTicketChange: (tickets: { [key: string]: number }) => void;
}

const TicketSelector: React.FC<TicketSelectorProps> = ({
  ticketTypes,
  selectedTickets,
  onTicketChange,
}) => {
  const handleIncrement = (ticketId: string, available: number) => {
    const currentQty = selectedTickets[ticketId] || 0;
    if (currentQty < available && currentQty < 10) {
      const updated = { ...selectedTickets, [ticketId]: currentQty + 1 };
      onTicketChange(updated);
    }
  };

  const handleDecrement = (ticketId: string) => {
    const currentQty = selectedTickets[ticketId] || 0;
    if (currentQty > 0) {
      const updated = { ...selectedTickets };
      if (currentQty === 1) {
        delete updated[ticketId];
      } else {
        updated[ticketId] = currentQty - 1;
      }
      onTicketChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Select Tickets</h3>

      {ticketTypes.map((ticket) => {
        const available = ticket.quantity - ticket.sold;
        const selected = selectedTickets[ticket.id] || 0;

        return (
          <div
            key={ticket.id}
            className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                {ticket.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {ticket.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-purple-600">
                  ₹{ticket.price.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-500">
                  {available > 0 ? (
                    <span className="text-green-600">
                      {available} available
                    </span>
                  ) : (
                    <span className="text-red-600">Sold Out</span>
                  )}
                </p>
              </div>
            </div>

            {/* Ticket Counter */}
            {available > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDecrement(ticket.id)}
                    disabled={selected === 0}
                    className="w-10 h-10 rounded-full border-2 border-purple-600 flex items-center justify-center text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center text-lg font-semibold text-gray-900">
                    {selected}
                  </span>
                  <button
                    onClick={() => handleIncrement(ticket.id, available)}
                    disabled={selected >= available || selected >= 10}
                    className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {selected > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ₹{(ticket.price * selected).toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TicketSelector;