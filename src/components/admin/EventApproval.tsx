"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Event } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar, MapPin, Users, Tag, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/currency-utils";
import { format } from "date-fns";

interface EventApprovalProps {
  event: any;
}

export default function EventApproval({ event }: EventApprovalProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const approveEvent = useMutation(api.events.approveEvent);
  const rejectEvent = useMutation(api.events.rejectEvent);

  const handleApprove = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      await approveEvent({
        eventId: event._id,
        approvedBy: user.id as Id<"users">,
      });
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || !rejectionReason.trim()) return;

    setIsProcessing(true);
    try {
      await rejectEvent({
        eventId: event._id,
        rejectionReason,
        approvedBy: user.id as Id<"users">,
      });
      setShowRejectModal(false);
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Failed to reject event");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-l-4 border-yellow-500">
        <div className="grid md:grid-cols-3 gap-6 p-6">
          {/* Event Image */}
          <div className="relative h-64 rounded-xl overflow-hidden">
            <Image
              src={event.bannerImage}
              alt={event.title}
              fill
              className="object-cover"
            />
            {event.isFeatured && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Featured
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 line-clamp-2">{event.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(event.dateTime.start), "PPP")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.dateTime.start), "p")} - {format(new Date(event.dateTime.end), "p")}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-semibold text-gray-900">{typeof event.venue === 'string' ? event.venue : event.venue.name}</p>
                  <p className="text-sm text-gray-600">
                    {typeof event.venue === 'string' ? '' : `${event.venue.city}, ${event.venue.state}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Tag className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">{event.category}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-semibold text-gray-900">
                    {event.totalCapacity} Total
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.soldTickets} Sold
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Types */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Ticket Types</h4>
              <div className="grid gap-2">
                {event.ticketTypes.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{ticket.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {ticket.quantity} | Sold: {ticket.sold}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {formatCurrency(ticket.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 p-6 bg-gray-50">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isProcessing ? "Processing..." : "Approve Event"}</span>
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <XCircle className="w-5 h-5" />
            <span>Reject Event</span>
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reject Event</h3>
            <p className="text-gray-600 mb-6">
              Please provide a reason for rejecting this event.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}