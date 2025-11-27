export interface Booking {
    _id: string;
    bookingNumber: string;
    eventId: string;
    userId?: string;
    guestDetails?: {
      name: string;
      email: string;
      phone: string;
    };
    tickets: BookingTicket[];
    totalAmount: number;
    pricing: {
      subtotal: number;
      gst: number;
      platformFee: number;
      total: number;
    };
    paymentId: string;
    status: "pending" | "confirmed" | "cancelled" | "refunded";
    qrCode?: string;
    pdfUrl?: string;
    isUsed: boolean;
    usedAt?: number;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface BookingTicket {
    ticketTypeId: string;
    ticketTypeName: string;
    quantity: number;
    price: number;
  }
  
  export interface BookingWithEvent extends Booking {
    event: Event;
  }
  
  export interface CreateBookingData {
    eventId: string;
    tickets: BookingTicket[];
    guestDetails?: {
      name: string;
      email: string;
      phone: string;
    };
  }
  
  export interface Payment {
    _id: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: "created" | "authorized" | "captured" | "failed" | "refunded";
    method?: string;
    userId?: string;
    eventId: string;
    metadata?: any;
    failureReason?: string;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface Refund {
    _id: string;
    bookingId: string;
    paymentId: string;
    userId?: string;
    amount: number;
    reason: string;
    status: "requested" | "approved" | "rejected" | "processed";
    razorpayRefundId?: string;
    approvedBy?: string;
    approvedAt?: number;
    rejectionReason?: string;
    processedAt?: number;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface Payout {
    _id: string;
    organiserId: string;
    eventId: string;
    amount: number;
    platformFee: number;
    netAmount: number;
    status: "pending" | "processing" | "completed" | "failed";
    transactionId?: string;
    processedBy?: string;
    processedAt?: number;
    failureReason?: string;
    createdAt: number;
    updatedAt: number;
  }