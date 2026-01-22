"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EventForm from "@/components/organiser/EventForm";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createEvent = useMutation(api.events.createEvent);

  const handleSubmit = async (eventData: any) => {
    setIsSubmitting(true);
    try {
      // Validate dates are not in the past
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
      const endDateTime = new Date(`${eventData.endDate}T${eventData.endTime}`);
      const now = new Date();
      
      // Set time to start of day for comparison (only check date, not time)
      const startDateOnly = new Date(eventData.startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const todayOnly = new Date();
      todayOnly.setHours(0, 0, 0, 0);

      if (startDateOnly < todayOnly) {
        alert("❌ Cannot create events in the past! Please select today or a future date.");
        setIsSubmitting(false);
        return;
      }

      if (endDateTime <= startDateTime) {
        alert("❌ End date and time must be after start date and time!");
        setIsSubmitting(false);
        return;
      }

      // Transform form data to match Convex schema
      const transformedData = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        bannerImage: eventData.coverImage, // Map coverImage to bannerImage

        // Convert dates and times to timestamps
        dateTime: {
          start: startDateTime.getTime(),
          end: endDateTime.getTime(),
        },

        // Structure venue as object
        venue: {
          name: eventData.venue,
          address: eventData.address,
          city: eventData.city,
          state: eventData.state,
          pincode: eventData.pincode,
        },

        // Transform ticket types
        ticketTypes: eventData.ticketTypes.map((ticket: any, index: number) => ({
          id: `ticket-${Date.now()}-${index}`,
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          sold: 0, // Initially 0 tickets sold
          description: ticket.description || "",
        })),

        // Add required fields
        tags: [], // Empty tags for now
        status: "published" as const, // Auto-publish - no admin approval required

        // Include custom fields
        customFields: eventData.customFields || [],

        // Mega Event Configuration
        isMegaEvent: eventData.isMegaEvent || false,
        megaEventConfig: eventData.isMegaEvent ? {
          allowSubEvents: eventData.allowSubEvents || false,
          maxSubEvents: eventData.maxSubEvents || 10,
          sharedTicketing: false, // Each sub-event has separate tickets
        } : undefined,

        // Cancellation Policy
        cancellationPolicy: eventData.cancellationPolicy || {
          isCancellable: false,
          refundPercentage: 0,
          deadlineHoursBeforeStart: 24,
          description: "",
        },
      };

      const eventId = await createEvent(transformedData);
      router.push(`/management/organiser/events/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Back to Events
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Create New Event
        </h1>
        <p className="text-gray-600">
          Fill in the details below to create your event
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <EventForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
