"use client";

import { useState } from "react";
import { TicketType } from "@/types";
import { formatCurrency } from "@/lib/currency-utils";
import { Minus, Plus, Users } from "lucide-react";

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  selectedTickets: { [key: string]: number };
  onTicketChange: (ticketId: string, quantity: number) => void;
}

export default function TicketSelector({
  ticketTypes,
  selectedTickets,
  onTicketChange,
}: TicketSelectorProps) {
  const handleIncrease = (ticketId: string, maxQuantity: number) => {
    const current = selectedTickets[ticketId] || 0;
    if (current < maxQuantity && current < 10) {
      onTicketChange(ticketId, current + 1);
    }
  };

  const handleDecrease = (ticketId: string) => {
    const current = selectedTickets[ticketId] || 0;
    if (current > 0) {
      onTicketChange(ticketId, current - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Select Tickets</h3>
          <p className="text-gray-600">Choose the number of tickets you need</p>
        </div>
      </div>

      {ticketTypes.map((ticket) => {
        const available = ticket.quantity - ticket.sold;
        const selected = selectedTickets[ticket.id] || 0;
        const isAvailable = available > 0;

        return (
          <div
            key={ticket.id}
            className={`bg-white rounded-xl p-6 border-2 transition-all duration-200 ${
              selected > 0
                ? "border-purple-500 shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            } ${!isAvailable ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{ticket.name}</h4>
                  {ticket.sold > ticket.quantity * 0.8 && isAvailable && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      Selling Fast!
                    </span>
                  )}
                </div>
                {ticket.description && (
                  <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {available} tickets available
                </p>
              </div>

              <div className="text-right ml-6">
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(ticket.price)}
                </p>
                <p className="text-sm text-gray-500">per ticket</p>
              </div>
            </div>

            {isAvailable ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDecrease(ticket.id)}
                    disabled={selected === 0}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>

                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-gray-900">{selected}</span>
                  </div>

                  <button
                    onClick={() => handleIncrease(ticket.id, available)}
                    disabled={selected >= available || selected >= 10}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>

                {selected > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(ticket.price * selected)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                <span className="text-red-600 font-semibold">Sold Out</span>
              </div>
            )}
          </div>
        );
      })}

      {ticketTypes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tickets available for this event</p>
        </div>
      )}
    </div>
  );
}