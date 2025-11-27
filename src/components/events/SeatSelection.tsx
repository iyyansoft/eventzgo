"use client";

import { useState } from "react";
import { TicketType } from "@/types";
import { formatCurrency } from "@/lib/currency-utils";

interface SeatSelectionProps {
  ticketTypes: TicketType[];
  onSelectionComplete: (selectedSeats: { [key: string]: string[] }) => void;
}

export default function SeatSelection({
  ticketTypes,
  onSelectionComplete,
}: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<{ [key: string]: string[] }>({});

  // Generate seat layout (simplified version)
  const generateSeatLayout = (ticketType: TicketType) => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = 10;
    const seats = [];

    for (let row of rows) {
      const rowSeats = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`;
        const isSelected = selectedSeats[ticketType.id]?.includes(seatId);
        const isBooked = Math.random() > 0.7; // Mock booked seats

        rowSeats.push({
          id: seatId,
          isBooked,
          isSelected,
        });
      }
      seats.push(rowSeats);
    }

    return seats;
  };

  const handleSeatClick = (ticketTypeId: string, seatId: string) => {
    setSelectedSeats((prev) => {
      const currentSeats = prev[ticketTypeId] || [];
      const isSelected = currentSeats.includes(seatId);

      if (isSelected) {
        return {
          ...prev,
          [ticketTypeId]: currentSeats.filter((s) => s !== seatId),
        };
      } else {
        return {
          ...prev,
          [ticketTypeId]: [...currentSeats, seatId],
        };
      }
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    Object.keys(selectedSeats).forEach((ticketTypeId) => {
      const ticketType = ticketTypes.find((t) => t.id === ticketTypeId);
      if (ticketType) {
        total += ticketType.price * selectedSeats[ticketTypeId].length;
      }
    });
    return total;
  };

  const getTotalSeats = () => {
    return Object.values(selectedSeats).reduce(
      (sum, seats) => sum + seats.length,
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-gray-900 mb-4">Seat Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded border border-gray-300"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded cursor-not-allowed"></div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
        </div>
      </div>

      {/* Seat Layout for each ticket type */}
      {ticketTypes.map((ticketType) => (
        <div key={ticketType.id} className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{ticketType.name}</h3>
              <p className="text-sm text-gray-600">
                {formatCurrency(ticketType.price)} per seat
              </p>
            </div>
            <span className="text-sm text-gray-600">
              {selectedSeats[ticketType.id]?.length || 0} selected
            </span>
          </div>

          {/* Screen/Stage */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 rounded-lg font-semibold mb-2">
              SCREEN/STAGE
            </div>
          </div>

          {/* Seats Grid */}
          <div className="space-y-3 overflow-x-auto">
            {generateSeatLayout(ticketType).map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-2 justify-center">
                <span className="text-sm font-semibold text-gray-600 w-8">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
                {row.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(ticketType.id, seat.id)}
                    disabled={seat.isBooked}
                    className={`w-8 h-8 rounded text-xs font-semibold transition-all duration-200 ${
                      seat.isBooked
                        ? "bg-gray-400 cursor-not-allowed"
                        : seat.isSelected
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110"
                        : "bg-gray-200 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    {seat.id.slice(-2)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary & Confirm */}
      <div className="sticky bottom-0 bg-white rounded-xl shadow-2xl p-6 border-t-4 border-purple-600">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Seats</p>
            <p className="text-2xl font-bold text-gray-900">{getTotalSeats()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(getTotalPrice())}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectionComplete(selectedSeats)}
          disabled={getTotalSeats() === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}