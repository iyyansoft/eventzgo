import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("organiser"),
      v.literal("admin"),
      v.literal("vendor"),
      v.literal("speaker"),
      v.literal("sponsor")
    ),
    profileImage: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Organisers table (extended user data)
  organisers: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    institutionName: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
    }),
    gstNumber: v.string(),
    panNumber: v.string(),
    tanNumber: v.optional(v.string()),
    bankDetails: v.object({
      accountHolderName: v.string(),
      accountNumber: v.string(),
      ifscCode: v.string(),
      bankName: v.string(),
      branchName: v.string(),
    }),
    documents: v.object({
      gstCertificate: v.optional(v.string()),
      panCard: v.optional(v.string()),
      cancelledCheque: v.optional(v.string()),
      bankStatement: v.optional(v.string()),
    }),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_approval_status", ["approvalStatus"]),

  // Vendors table (service providers)
  vendors: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    companyName: v.string(),
    serviceType: v.string(), // Catering, Photography, AV Equipment, etc.
    services: v.array(v.string()), // List of services offered
    priceRange: v.string(),
    location: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    portfolio: v.optional(v.array(v.string())), // URLs to portfolio images
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_approval_status", ["approvalStatus"])
    .index("by_service_type", ["serviceType"]),

  // Speakers table (professional speakers)
  speakers: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    title: v.string(), // Professional title
    bio: v.string(),
    expertise: v.array(v.string()), // Areas of expertise
    topics: v.array(v.string()), // Speaking topics
    languages: v.array(v.string()),
    speakingFee: v.string(),
    location: v.string(),
    companyName: v.optional(v.string()), // Current position/company
    website: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_approval_status", ["approvalStatus"]),

  // Sponsors table (brand sponsors)
  sponsors: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    companyName: v.string(),
    industry: v.string(),
    description: v.string(),
    sponsorshipBudget: v.string(),
    preferredEvents: v.array(v.string()), // Types of events they prefer to sponsor
    location: v.string(),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_approval_status", ["approvalStatus"])
    .index("by_industry", ["industry"]),

  // Events table
  events: defineTable({
    organiserId: v.id("organisers"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    bannerImage: v.string(),
    venue: v.object({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
      coordinates: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
    }),
    dateTime: v.object({
      start: v.number(),
      end: v.number(),
    }),
    ticketTypes: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        sold: v.number(),
        description: v.optional(v.string()),
      })
    ),
    // Custom fields for additional attendee information
    customFields: v.optional(
      v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("email"),
            v.literal("phone"),
            v.literal("number"),
            v.literal("select"),
            v.literal("textarea"),
            v.literal("checkbox"),
            v.literal("date")
          ),
          required: v.boolean(),
          options: v.optional(v.array(v.string())), // For select type
          placeholder: v.optional(v.string()),
        })
      )
    ),
    totalCapacity: v.number(),
    soldTickets: v.number(),
    pricing: v.object({
      basePrice: v.number(),
      gst: v.number(),
      platformFee: v.number(),
      totalPrice: v.number(),
    }),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("published"),
      v.literal("cancelled")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_state", ["venue.state"])
    .index("by_city", ["venue.city"])
    .index("by_date", ["dateTime.start"])
    .index("by_featured", ["isFeatured"]),

  // Bookings table
  bookings: defineTable({
    bookingNumber: v.string(),
    eventId: v.id("events"),
    userId: v.optional(v.id("users")), // Optional for guest bookings
    guestDetails: v.optional(
      v.object({
        name: v.string(),
        email: v.string(),
        phone: v.string(),
      })
    ),
    tickets: v.array(
      v.object({
        ticketTypeId: v.string(),
        ticketTypeName: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    // Custom field responses from checkout
    customFieldResponses: v.optional(
      v.array(
        v.object({
          fieldId: v.string(),
          label: v.string(),
          value: v.string(),
        })
      )
    ),
    totalAmount: v.number(),
    pricing: v.object({
      subtotal: v.number(),
      gst: v.number(),
      platformFee: v.number(),
      total: v.number(),
    }),
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    qrCode: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    isUsed: v.boolean(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_booking_number", ["bookingNumber"])
    .index("by_event_id", ["eventId"])
    .index("by_user_id", ["userId"])
    .index("by_payment_id", ["paymentId"])
    .index("by_status", ["status"]),

  // Payments table
  payments: defineTable({
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("created"),
      v.literal("authorized"),
      v.literal("captured"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    method: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    eventId: v.id("events"),
    metadata: v.optional(v.any()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_razorpay_order_id", ["razorpayOrderId"])
    .index("by_razorpay_payment_id", ["razorpayPaymentId"])
    .index("by_user_id", ["userId"])
    .index("by_event_id", ["eventId"])
    .index("by_status", ["status"]),

  // Refunds table
  refunds: defineTable({
    bookingId: v.id("bookings"),
    paymentId: v.id("payments"),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    reason: v.string(),
    status: v.union(
      v.literal("requested"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("processed")
    ),
    razorpayRefundId: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_booking_id", ["bookingId"])
    .index("by_payment_id", ["paymentId"])
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"]),

  // Payouts table
  payouts: defineTable({
    organiserId: v.id("organisers"),
    eventId: v.id("events"),
    amount: v.number(),
    platformFee: v.number(),
    netAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    transactionId: v.optional(v.string()),
    processedBy: v.optional(v.id("users")),
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_event_id", ["eventId"])
    .index("by_status", ["status"]),

  // Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_is_read", ["isRead"]),

  // Email logs table
  emailLogs: defineTable({
    to: v.string(),
    subject: v.string(),
    type: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    provider: v.string(),
    providerId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_to", ["to"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),
});