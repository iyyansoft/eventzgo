import { Id } from "@/convex/_generated/dataModel";

export type UserId = Id<"users">;
export type OrganiserId = Id<"organisers">;
export type EventId = Id<"events">;
export type BookingId = Id<"bookings">;
export type PaymentId = Id<"payments">;
export type RefundId = Id<"refunds">;
export type PayoutId = Id<"payouts">;
export type NotificationId = Id<"notifications">;

export interface ConvexDocument {
  _id: string;
  _creationTime: number;
}