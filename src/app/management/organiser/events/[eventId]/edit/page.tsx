"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import EventForm from "@/components/organiser/EventForm";

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.eventId as Id<"events">;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const updateEvent = useMutation(api.events.updateEvent);

    // Fetch the existing event data
    const event = useQuery(api.events.getEventById, { eventId });

    // Transform event data to form format
    const getInitialData = () => {
        if (!event) return null;

        // Convert timestamps back to date/time strings
        const startDate = new Date(event.dateTime.start);
        const endDate = new Date(event.dateTime.end);

        return {
            title: event.title,
            description: event.description,
            category: event.category,
            coverImage: event.bannerImage,

            // Convert timestamps to date/time strings
            startDate: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endDate: endDate.toISOString().split('T')[0],
            endTime: endDate.toTimeString().slice(0, 5),

            // Venue details
            venue: event.venue.name,
            address: event.venue.address,
            city: event.venue.city,
            state: event.venue.state,
            pincode: event.venue.pincode,

            // Ticket types (remove 'sold' field for editing)
            ticketTypes: event.ticketTypes.map(({ sold, ...ticket }) => ticket),

            // Custom fields
            customFields: event.customFields || [],
        };
    };

    const handleSubmit = async (eventData: any) => {
        setIsSubmitting(true);
        try {
            // Transform form data to match Convex schema
            const transformedData = {
                eventId,
                title: eventData.title,
                description: eventData.description,
                category: eventData.category,
                bannerImage: eventData.coverImage,

                // Convert dates and times to timestamps
                dateTime: {
                    start: new Date(`${eventData.startDate}T${eventData.startTime}`).getTime(),
                    end: new Date(`${eventData.endDate}T${eventData.endTime}`).getTime(),
                },

                // Structure venue as object
                venue: {
                    name: eventData.venue,
                    address: eventData.address,
                    city: eventData.city,
                    state: eventData.state,
                    pincode: eventData.pincode,
                },

                // Transform ticket types (preserve sold count)
                ticketTypes: eventData.ticketTypes.map((ticket: any, index: number) => {
                    // Find the original ticket to preserve sold count
                    const originalTicket = event?.ticketTypes[index];
                    return {
                        id: ticket.id || `ticket-${Date.now()}-${index}`,
                        name: ticket.name,
                        price: ticket.price,
                        quantity: ticket.quantity,
                        sold: originalTicket?.sold || 0, // Preserve sold count
                        description: ticket.description || "",
                    };
                }),

                tags: event?.tags || [],
            };

            await updateEvent(transformedData);
            router.push(`/management/organiser/events/${eventId}`);
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Failed to update event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!event) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading event...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900 flex items-center mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Event
                </button>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Edit Event
                </h1>
                <p className="text-gray-600">
                    Update your event details
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
                <EventForm
                    initialData={getInitialData()}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    isEditing={true}
                />
            </div>
        </div>
    );
}
