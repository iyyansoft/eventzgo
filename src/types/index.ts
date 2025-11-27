import { Id } from "../../convex/_generated/dataModel";

// User Types
export type UserRole = "user" | "organiser" | "admin";

export interface User {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Organiser Types
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

export interface Documents {
  gstCertificate?: string;
  panCard?: string;
  cancelledCheque?: string;
  bankStatement?: string;
}

export interface Organiser {
  _id: Id<"organisers">;
  userId: Id<"users">;
  clerkId: string;
  institutionName: string;
  address: Address;
  gstNumber: string;
  panNumber: string;
  tanNumber?: string;
  bankDetails: BankDetails;
  documents: Documents;
  approvalStatus: ApprovalStatus;
  approvedBy?: Id<"users">;
  approvedAt?: number;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Event Types
export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "published"
  | "cancelled";

export interface Venue {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DateTime {
  start: number;
  end: number;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
}

export interface Pricing {
  basePrice: number;
  gst: number;
  platformFee: number;
  totalPrice: number;
}

export interface Event {
  _id: Id<"events">;
  organiserId: Id<"organisers">;
  title: string;
  description: string;
  category: string;
  tags: string[];
  bannerImage: string;
  venue: Venue;
  dateTime: DateTime;
  ticketTypes: TicketType[];
  totalCapacity: number;
  soldTickets: number;
  pricing: Pricing;
  status: EventStatus;
  approvedBy?: Id<"users">;
  approvedAt?: number;
  rejectionReason?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Booking Types
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded";

export interface GuestDetails {
  name: string;
  email: string;
  phone: string;
}

export interface BookingTicket {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
}

export interface BookingPricing {
  subtotal: number;
  gst: number;
  platformFee: number;
  total: number;
}

export interface Booking {
  _id: Id<"bookings">;
  bookingNumber: string;
  eventId: Id<"events">;
  userId?: Id<"users">;
  guestDetails?: GuestDetails;
  tickets: BookingTicket[];
  totalAmount: number;
  pricing: BookingPricing;
  paymentId: Id<"payments">;
  status: BookingStatus;
  qrCode?: string;
  pdfUrl?: string;
  isUsed: boolean;
  usedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Payment Types
export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface Payment {
  _id: Id<"payments">;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  userId?: Id<"users">;
  eventId: Id<"events">;
  metadata?: any;
  failureReason?: string;
  createdAt: number;
  updatedAt: number;
}

// Refund Types
export type RefundStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "processed";

export interface Refund {
  _id: Id<"refunds">;
  bookingId: Id<"bookings">;
  paymentId: Id<"payments">;
  userId?: Id<"users">;
  amount: number;
  reason: string;
  status: RefundStatus;
  razorpayRefundId?: string;
  approvedBy?: Id<"users">;
  approvedAt?: number;
  rejectionReason?: string;
  processedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Payout Types
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface Payout {
  _id: Id<"payouts">;
  organiserId: Id<"organisers">;
  eventId: Id<"events">;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: PayoutStatus;
  transactionId?: string;
  processedBy?: Id<"users">;
  processedAt?: number;
  failureReason?: string;
  createdAt: number;
  updatedAt: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

// Indian States
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];