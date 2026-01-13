"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, use } from "react";
import EventForm from "@/components/organiser/EventForm";
import { Id } from "@/convex/_generated/dataModel";

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedParams = use(params);

  const event = useQuery(api.events.getEventById, {
    eventId: resolvedParams.eventId as Id<"events">
  });
  const updateEvent = useMutation(api.events.updateEvent);

  const handleSubmit = async (eventData: any) => {
    setIsSubmitting(true);
    try {
      // 1. Construct Venue Object
      const venue = {
        name: eventData.venue || "",
        address: eventData.address || "",
        city: eventData.city || "",
        state: eventData.state || "",
        pincode: eventData.pincode || "",
      };

      // 2. Construct DateTime Object
      let dateTime;
      if (eventData.startDate && eventData.startTime && eventData.endDate && eventData.endTime) {
        // Ensure proper date objects
        const start = new Date(`${eventData.startDate}T${eventData.startTime}`).getTime();
        const end = new Date(`${eventData.endDate}T${eventData.endTime}`).getTime();
        dateTime = { start, end };
      }

      // 3. Prepare Update Payload (only include defined fields)
      await updateEvent({
        eventId: resolvedParams.eventId as Id<"events">,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        bannerImage: eventData.coverImage, // Map coverImage to bannerImage
        galleryImages: eventData.galleryImages,
        venue,
        dateTime,
        ticketTypes: eventData.ticketTypes,
        customFields: eventData.customFields,
        cancellationPolicy: eventData.cancellationPolicy,
        // Tags are not in the form yet, so we omit or pass existing if wired
        tags: eventData.tags
      });

      router.push("/management/organiser/events");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading event...</p>
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
          Back to Events
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
          initialData={event}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing
        />
      </div>
    </div>
  );
}