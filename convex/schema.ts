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
    city: v.optional(v.string()),
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
    userId: v.optional(v.id("users")), // Optional for custom auth
    clerkId: v.optional(v.string()), // Optional for custom auth

    // Custom Authentication
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    tempPasswordHash: v.optional(v.string()),
    tempPasswordExpiry: v.optional(v.number()),
    accountStatus: v.optional(v.union(
      v.literal("pending_verification"),
      v.literal("pending_approval"),
      v.literal("pending_setup"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("blocked")
    )),
    role: v.optional(v.string()), // "organiser" or "admin"
    emailVerificationToken: v.optional(v.string()),
    requirePasswordChange: v.optional(v.boolean()),
    failedLoginAttempts: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    passwordChangedAt: v.optional(v.number()),

    // Profile
    institutionName: v.string(),
    contactPerson: v.optional(v.string()),
    phone: v.optional(v.string()),
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
      panCard: v.optional(v.string()), // OLD - for backward compatibility
      panCardFront: v.optional(v.string()),
      panCardBack: v.optional(v.string()),
      cancelledCheque: v.optional(v.string()),
      bankStatement: v.optional(v.string()),
      bankProofType: v.optional(v.union(v.literal('cheque'), v.literal('statement'))),
    }),
    onboardingData: v.optional(v.any()),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.union(v.id("users"), v.id("organisers"))),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    isActive: v.boolean(),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    // Platform Fee Settings
    platformFeePercentage: v.optional(v.number()), // Default: 10
    customPlatformFee: v.optional(v.boolean()), // true if custom, false if using default
    platformFeeUpdatedAt: v.optional(v.number()),
    platformFeeUpdatedBy: v.optional(v.union(v.id("users"), v.id("organisers"))),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_approval_status", ["approvalStatus"])
    .index("by_account_status", ["accountStatus"])
    .index("by_email_verification_token", ["emailVerificationToken"]),

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
    galleryImages: v.optional(v.array(v.string())),
    venue: v.union(
      v.string(),
      v.object({
        name: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        pincode: v.string(),
        coordinates: v.optional(v.object({
          lat: v.number(),
          lng: v.number(),
        })),
      })
    ),
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
    cancellationPolicy: v.optional(v.object({
      isCancellable: v.boolean(),
      refundPercentage: v.number(), // 0-100
      deadlineHoursBeforeStart: v.number(),
      description: v.optional(v.string()),
    })),
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
      ticketGst: v.optional(v.number()),
      platformFeeGst: v.optional(v.number()),
    }),
    couponId: v.optional(v.id("coupons")),
    discountAmount: v.optional(v.number()),
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
    processedBy: v.optional(v.union(v.id("users"), v.id("organisers"))),
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_event_id", ["eventId"])
    .index("by_status", ["status"]),

  // Platform Fee History
  platformFeeHistory: defineTable({
    organiserId: v.id("organisers"),
    oldFee: v.number(),
    newFee: v.number(),
    changedBy: v.union(v.id("users"), v.id("organisers")),
    changedAt: v.number(),
    reason: v.optional(v.string()),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_changed_at", ["changedAt"]),


  // Notifications table (two-way communication)
  notifications: defineTable({
    senderId: v.id("users"),
    recipientId: v.optional(v.id("users")), // Optional for broadcast messages
    recipientType: v.string(), // "all", "user", "organiser", "vendor", "speaker", "sponsor", "admin", "individual"
    subject: v.string(),
    message: v.string(),
    priority: v.string(), // "low", "normal", "high"
    parentId: v.optional(v.id("notifications")), // For threading/replies
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sender_id", ["senderId"])
    .index("by_recipient_id", ["recipientId"])
    .index("by_recipient_type", ["recipientType"])
    .index("by_parent_id", ["parentId"])
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

  // Admin Navigation table
  adminNavigation: defineTable({
    label: v.string(),
    path: v.string(),
    icon: v.string(), // Icon name from lucide-react
    order: v.number(),
    category: v.union(v.literal("main"), v.literal("bottom")),
    isActive: v.boolean(),
  })
    .index("by_category_order", ["category", "order"])
    .index("by_is_active", ["isActive"]),

  // Uploaded Files (Convex Storage)
  uploadedFiles: defineTable({
    storageId: v.string(), // Convex storage ID
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.string(), // "gstCertificate", "panCard", "cancelledCheque", "bankStatement"
    uploadedBy: v.optional(v.id("organisers")), // Who uploaded it
    uploadedAt: v.number(),
  })
    .index("by_storage_id", ["storageId"])
    .index("by_category", ["category"]),

  // Sessions table for NextAuth.js and session management
  sessions: defineTable({
    userId: v.id("organisers"),
    sessionToken: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    deviceFingerprint: v.optional(v.string()),
    expiresAt: v.number(),
    lastActivityAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_session_token", ["sessionToken"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_is_active", ["isActive"]),

  // Rate limiting table for brute force protection
  rateLimits: defineTable({
    identifier: v.string(), // IP address or user ID
    action: v.string(), // "login", "password_reset", "api_call"
    attempts: v.number(),
    windowStart: v.number(),
    lastAttempt: v.number(),
  })
    .index("by_identifier_action", ["identifier", "action"])
    .index("by_window_start", ["windowStart"]),

  // Password reset tokens
  passwordResets: defineTable({
    organiserId: v.id("organisers"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    usedAt: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_token_hash", ["tokenHash"])
    .index("by_expires_at", ["expiresAt"]),

  // Email verification tokens
  emailVerifications: defineTable({
    organiserId: v.id("organisers"),
    email: v.string(),
    token: v.string(), // Unique verification token
    expiresAt: v.number(),
    verified: v.boolean(),
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_expires_at", ["expiresAt"]),

  // Security audit logs
  securityAuditLogs: defineTable({
    userId: v.optional(v.id("organisers")),
    eventType: v.string(), // "login_success", "login_failure", "password_change", etc.
    eventCategory: v.string(), // "authentication", "authorization", "data_access"
    description: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("critical")
    ),
    timestamp: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_event_type", ["eventType"])
    .index("by_severity", ["severity"])
    .index("by_timestamp", ["timestamp"]),

  // Support Tickets
  supportTickets: defineTable({
    ticketId: v.string(), // Readable ID like TICK-1001
    organiserId: v.id("organisers"),
    subject: v.string(),
    description: v.string(),
    category: v.string(), // "billing", "technical", "account", "other"
    tags: v.array(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    lastMessageAt: v.number(),
    assignedTo: v.optional(v.id("users")), // Admin user ID
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_status", ["status"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_updated_at", ["updatedAt"]),

  // Support Messages (Ticket Thread)
  supportMessages: defineTable({
    ticketId: v.id("supportTickets"),
    senderId: v.string(), // User ID or Organiser ID (as string)
    senderRole: v.union(v.literal("organiser"), v.literal("admin")),
    message: v.string(),
    attachments: v.optional(v.array(v.string())),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_ticket_id", ["ticketId"])
    .index("by_created_at", ["createdAt"]),

  // Financial Transactions - Complete audit trail of all money movements
  financialTransactions: defineTable({
    // Transaction Identity
    transactionId: v.string(), // TXN-YYYYMMDD-XXXXX
    type: v.union(
      v.literal("booking"),
      v.literal("refund"),
      v.literal("payout"),
      v.literal("fee"),
      v.literal("adjustment")
    ),

    // Relationships
    bookingId: v.optional(v.id("bookings")),
    eventId: v.optional(v.id("events")),
    organiserId: v.id("organisers"),
    userId: v.optional(v.id("users")),

    // Financial Details
    amount: v.number(),
    currency: v.string(), // "INR"

    // Breakdown
    breakdown: v.object({
      ticketAmount: v.number(),
      platformFee: v.number(),
      gst: v.number(),
      paymentGatewayFee: v.number(),
      netToOrganiser: v.number(),
    }),

    // Payment Gateway
    paymentGatewayId: v.optional(v.string()), // Razorpay order_id
    paymentMethod: v.optional(v.string()), // UPI/Card/NetBanking
    gatewayResponse: v.optional(v.any()),

    // Status & Timestamps
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("reversed")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),

    // Audit
    description: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_transaction_id", ["transactionId"])
    .index("by_booking_id", ["bookingId"])
    .index("by_event_id", ["eventId"])
    .index("by_organiser_id", ["organiserId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Payout Requests - Organiser withdrawal requests
  payoutRequests: defineTable({
    // Request Identity
    payoutId: v.string(), // PAYOUT-YYYYMMDD-XXXXX
    organiserId: v.id("organisers"),

    // Scope
    scope: v.union(v.literal("event"), v.literal("account")),
    eventId: v.optional(v.id("events")),

    // Financial Details
    requestedAmount: v.number(),
    eligibleAmount: v.number(),

    breakdown: v.object({
      totalRevenue: v.number(),
      platformFee: v.number(),
      gst: v.number(),
      gatewayFees: v.number(),
      previousPayouts: v.number(),
      refundsReserve: v.number(),

      // Tax Deductions
      tdsAmount: v.optional(v.number()), // TDS deducted (if applicable)
      tdsPercentage: v.optional(v.number()), // TDS rate (1%, 2%, etc.)

      // Additional Deductions
      penalties: v.optional(v.number()), // Any penalties
      adjustments: v.optional(v.number()), // Manual adjustments
      otherDeductions: v.optional(v.number()), // Other deductions

      // Final Amount
      netPayable: v.number(),

      // GST Details
      gstNumber: v.optional(v.string()), // Organiser's GST number
      invoiceNumber: v.optional(v.string()), // Generated invoice number
    }),

    // Bank Details (snapshot at request time)
    bankDetails: v.object({
      accountHolderName: v.string(),
      accountNumber: v.string(),
      ifscCode: v.string(),
      bankName: v.string(),
      branchName: v.string(),
    }),

    // Workflow
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("processing"),
      v.literal("paid"),
      v.literal("rejected"),
      v.literal("failed")
    ),
    requestedAt: v.number(),
    requestedBy: v.id("organisers"),

    // Approval
    reviewedBy: v.optional(v.union(v.id("organisers"), v.id("users"))),
    reviewedAt: v.optional(v.number()),
    approvalNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),

    // Payment Processing
    paymentMethod: v.optional(v.union(
      v.literal("NEFT"),
      v.literal("RTGS"),
      v.literal("IMPS"),
      v.literal("UPI")
    )),
    utrNumber: v.optional(v.string()), // Unique Transaction Reference
    paymentProof: v.optional(v.string()), // URL to receipt/screenshot
    processedAt: v.optional(v.number()),
    processedBy: v.optional(v.union(v.id("organisers"), v.id("users"))),

    // Reconciliation
    reconciledAt: v.optional(v.number()),
    reconciledBy: v.optional(v.union(v.id("organisers"), v.id("users"))),

    // Audit
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_payout_id", ["payoutId"])
    .index("by_organiser_id", ["organiserId"])
    .index("by_event_id", ["eventId"])
    .index("by_status", ["status"])
    .index("by_requested_at", ["requestedAt"])
    .index("by_created_at", ["createdAt"]),

  // Payout Schedules - Automated payout configuration
  payoutSchedules: defineTable({
    organiserId: v.id("organisers"),
    eventId: v.optional(v.id("events")),

    // Schedule Configuration
    frequency: v.union(
      v.literal("manual"),
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
    dayOfWeek: v.optional(v.number()), // 0-6 for weekly
    dayOfMonth: v.optional(v.number()), // 1-31 for monthly

    // Thresholds
    minimumAmount: v.number(), // Don't payout if below this
    autoApproveThreshold: v.number(), // Auto-approve if below this

    // Status
    isActive: v.boolean(),
    nextPayoutDate: v.optional(v.number()),
    lastPayoutDate: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_event_id", ["eventId"])
    .index("by_is_active", ["isActive"])
    .index("by_next_payout_date", ["nextPayoutDate"]),

  // Payout Reconciliation - Bank statement matching
  payoutReconciliation: defineTable({
    payoutId: v.id("payoutRequests"),

    // Verification
    bankStatementAmount: v.optional(v.number()),
    bankStatementDate: v.optional(v.number()),
    bankStatementReference: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("matched"),
      v.literal("mismatched"),
      v.literal("disputed")
    ),
    discrepancyAmount: v.optional(v.number()),
    discrepancyReason: v.optional(v.string()),

    // Resolution
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.union(v.id("organisers"), v.id("users"))),
    resolutionNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_payout_id", ["payoutId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // ============================================
  // TICKET VERIFICATION SYSTEM
  // ============================================

  // Verification Staff - Staff members who can scan tickets
  verificationStaff: defineTable({
    // Identity
    organiserId: v.id("organisers"),
    eventId: v.optional(v.id("events")), // Optional - can be assigned to specific events or all events

    // Staff Details
    staffName: v.string(),
    staffEmail: v.string(),
    staffPhone: v.string(),

    // Authentication
    username: v.string(),
    passwordHash: v.string(),
    tempPassword: v.optional(v.string()),

    // Role & Permissions
    role: v.union(
      v.literal("scanner"),  // Can only scan tickets
      v.literal("manager"),  // Can scan + view analytics
      v.literal("admin")     // Full access
    ),
    permissions: v.object({
      canScanTickets: v.boolean(),
      canViewAnalytics: v.boolean(),
      canManageStaff: v.boolean(),
      canIssueRefunds: v.boolean(),
      canOverrideScans: v.boolean(), // Can mark already-used tickets as valid
    }),

    // Status
    isActive: v.boolean(),
    isDeleted: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("organisers"),
    updatedAt: v.number(),
  })
    .index("by_organiser_id", ["organiserId"])
    .index("by_event_id", ["eventId"])
    .index("by_username", ["username"])
    .index("by_is_active", ["isActive"]),

  // Ticket Scans - Log of all ticket scan attempts
  ticketScans: defineTable({
    // Scan Identity
    scanId: v.string(), // SCAN-YYYYMMDD-XXXXX

    // Relationships
    bookingId: v.optional(v.id("bookings")),
    eventId: v.optional(v.id("events")),
    scannerId: v.id("verificationStaff"),

    // Scan Details
    scanResult: v.union(
      v.literal("valid"),           // Ticket is valid, entry granted
      v.literal("already_used"),    // Ticket already scanned
      v.literal("wrong_event"),     // Ticket for different event
      v.literal("cancelled"),       // Booking cancelled
      v.literal("refunded"),        // Booking refunded
      v.literal("payment_pending"), // Payment not confirmed
      v.literal("invalid_qr"),      // QR code invalid/tampered
      v.literal("expired")          // Event date passed
    ),

    // QR Data
    qrData: v.string(), // Raw QR code data
    qrHash: v.string(), // Hash for validation

    // Location & Device
    scanLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    deviceInfo: v.optional(v.object({
      userAgent: v.string(),
      deviceId: v.string(),
    })),

    // Override (if admin manually allows entry)
    wasOverridden: v.boolean(),
    overrideReason: v.optional(v.string()),
    overriddenBy: v.optional(v.id("verificationStaff")),

    // Timestamps
    scannedAt: v.number(),
  })
    .index("by_booking_id", ["bookingId"])
    .index("by_event_id", ["eventId"])
    .index("by_scanner_id", ["scannerId"])
    .index("by_scan_result", ["scanResult"])
    .index("by_scanned_at", ["scannedAt"]),

  // ============================================
  // COUPON SYSTEM
  // ============================================

  // Coupons - Discount codes
  coupons: defineTable({
    // Coupon Identity
    code: v.string(), // SUMMER2026, EARLYBIRD, etc.
    name: v.string(),
    description: v.string(),

    // Ownership
    organiserId: v.id("organisers"),
    eventId: v.optional(v.id("events")), // Null = applies to all organiser's events

    // Discount Details
    discountType: v.union(
      v.literal("percentage"), // 10%, 20%, etc.
      v.literal("fixed"),      // ₹100, ₹500, etc.
      v.literal("bogo")        // Buy One Get One
    ),
    discountValue: v.number(), // Percentage (10, 20) or Amount (100, 500)
    maxDiscount: v.optional(v.number()), // Cap for percentage discounts

    // Validity Period
    validFrom: v.number(),
    validUntil: v.number(),

    // Usage Limits
    maxUses: v.optional(v.number()), // Total uses allowed (null = unlimited)
    maxUsesPerUser: v.optional(v.number()), // Per user limit (null = unlimited)
    currentUses: v.number(), // Current usage count

    // Conditions
    minPurchaseAmount: v.optional(v.number()), // Minimum cart value
    applicableTicketTypes: v.optional(v.array(v.string())), // Specific ticket type IDs
    firstTimeUserOnly: v.boolean(), // Only for first-time users

    // Status
    isActive: v.boolean(),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("organisers"),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_organiser_id", ["organiserId"])
    .index("by_event_id", ["eventId"])
    .index("by_is_active", ["isActive"])
    .index("by_valid_from", ["validFrom"])
    .index("by_valid_until", ["validUntil"]),

  // Coupon Usages - Track who used which coupon
  couponUsages: defineTable({
    // Relationships
    couponId: v.id("coupons"),
    bookingId: v.id("bookings"),
    userId: v.optional(v.id("users")), // Optional for guest bookings
    eventId: v.id("events"),

    // Usage Details
    couponCode: v.string(), // Denormalized for easy reporting
    originalAmount: v.number(),
    discountApplied: v.number(),
    finalAmount: v.number(),

    // Timestamps
    usedAt: v.number(),
  })
    .index("by_coupon_id", ["couponId"])
    .index("by_booking_id", ["bookingId"])
    .index("by_user_id", ["userId"])
    .index("by_event_id", ["eventId"])
    .index("by_used_at", ["usedAt"]),

  // Admins table (for admin portal authentication)
  admins: defineTable({
    username: v.string(),
    password: v.string(), // Bcrypt hashed password
    email: v.string(),
    role: v.string(), // "admin", "super_admin", etc.
    isActive: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_is_active", ["isActive"]),
});