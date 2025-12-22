# 📋 Organiser Sign-Up & Onboarding Flow

**Date:** 2025-12-19  
**Status:** FULLY IMPLEMENTED ✅

---

## 🎯 Overview

When a user signs up as an **organiser** through Clerk, the system:
1. ✅ Stores the user in Clerk with role metadata
2. ✅ Syncs the user to Convex `users` table
3. ✅ Redirects to onboarding page
4. ✅ Collects detailed organiser information
5. ✅ Creates organiser record in Convex `organisers` table
6. ✅ Sets approval status to "pending"
7. ✅ Waits for admin approval

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER VISITS MANAGEMENT PORTAL                            │
│    /management                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CLICKS "SIGN UP" → ROLE SELECTION MODAL                  │
│    - Event Organizer                                        │
│    - Service Vendor                                         │
│    - Professional Speaker                                   │
│    - Brand Sponsor                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. REDIRECTED TO SIGN-UP PAGE                               │
│    /management/sign-up?role=organiser                       │
│                                                             │
│    Clerk SignUp Component with:                            │
│    - unsafeMetadata: {                                      │
│        role: "organiser",                                   │
│        status: "pending",                                   │
│        onboardingCompleted: false                           │
│      }                                                      │
│    - afterSignUpUrl: "/management/onboarding"               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CLERK CREATES USER ACCOUNT                               │
│    - User signs up with email/password or OAuth             │
│    - Clerk stores user with metadata                        │
│    - Clerk ID generated (e.g., user_abc123)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CLERK WEBHOOK TRIGGERED                                  │
│    POST /api/webhooks/clerk                                 │
│                                                             │
│    Event: "user.created"                                    │
│    Data: {                                                  │
│      id: "user_abc123",                                     │
│      email: "organiser@example.com",                        │
│      unsafe_metadata: {                                     │
│        role: "organiser",                                   │
│        status: "pending",                                   │
│        onboardingCompleted: false                           │
│      }                                                      │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. WEBHOOK SYNCS USER TO CONVEX                             │
│    convex.mutation(api.users.syncUser, {                    │
│      clerkId: "user_abc123",                                │
│      email: "organiser@example.com",                        │
│      firstName: "John",                                     │
│      lastName: "Doe",                                       │
│      ...                                                    │
│    })                                                       │
│                                                             │
│    Creates record in `users` table:                         │
│    {                                                        │
│      clerkId: "user_abc123",                                │
│      email: "organiser@example.com",                        │
│      role: "organiser",                                     │
│      isActive: true,                                        │
│      createdAt: timestamp                                   │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. USER REDIRECTED TO ONBOARDING                            │
│    /management/onboarding                                   │
│                                                             │
│    Middleware checks:                                       │
│    - User is authenticated ✅                               │
│    - Role is "organiser" ✅                                 │
│    - onboardingCompleted is false ✅                        │
│    → Allows access to onboarding page                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. ONBOARDING PAGE COLLECTS DETAILS                         │
│    /management/onboarding/page.tsx                          │
│                                                             │
│    Form Fields:                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │ BUSINESS INFORMATION                            │     │
│    │ - Institution Name                              │     │
│    │ - Address (Street, City, State, Pincode)       │     │
│    │ - Contact Phone                                 │     │
│    │ - Website (optional)                            │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │ TAX & LEGAL INFORMATION                         │     │
│    │ - GST Number                                    │     │
│    │ - PAN Number                                    │     │
│    │ - TAN Number (optional)                         │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │ BANK DETAILS                                    │     │
│    │ - Account Holder Name                           │     │
│    │ - Account Number                                │     │
│    │ - IFSC Code                                     │     │
│    │ - Bank Name                                     │     │
│    │ - Branch Name                                   │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │ DOCUMENTS (Optional)                            │     │
│    │ - GST Certificate                               │     │
│    │ - PAN Card                                      │     │
│    │ - Cancelled Cheque                              │     │
│    │ - Bank Statement                                │     │
│    └─────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. USER SUBMITS ONBOARDING FORM                             │
│    convex.mutation(api.management.createOrganiser, {        │
│      clerkId: "user_abc123",                                │
│      institutionName: "ABC Events Pvt Ltd",                 │
│      address: { ... },                                      │
│      gstNumber: "29ABCDE1234F1Z5",                          │
│      panNumber: "ABCDE1234F",                               │
│      bankDetails: { ... },                                  │
│      documents: { ... }                                     │
│    })                                                       │
│                                                             │
│    Creates record in `organisers` table:                    │
│    {                                                        │
│      userId: Id<"users">,                                   │
│      clerkId: "user_abc123",                                │
│      institutionName: "ABC Events Pvt Ltd",                 │
│      address: { street, city, state, pincode },             │
│      gstNumber: "29ABCDE1234F1Z5",                          │
│      panNumber: "ABCDE1234F",                               │
│      bankDetails: { ... },                                  │
│      documents: { ... },                                    │
│      approvalStatus: "pending",  ← IMPORTANT!               │
│      isActive: true,                                        │
│      createdAt: timestamp                                   │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. UPDATE CLERK METADATA                                   │
│     Updates Clerk user's publicMetadata:                    │
│     {                                                       │
│       role: "organiser",                                    │
│       status: "pending",                                    │
│       onboardingCompleted: true  ← UPDATED!                 │
│     }                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. REDIRECT TO PENDING APPROVAL PAGE                       │
│     /management/pending-approval                            │
│                                                             │
│     Middleware checks:                                      │
│     - User is authenticated ✅                              │
│     - Role is "organiser" ✅                                │
│     - onboardingCompleted is true ✅                        │
│     - status is "pending" ✅                                │
│     → Shows pending approval message                        │
│                                                             │
│     User sees:                                              │
│     "Your application is under review.                      │
│      We'll notify you within 24-48 hours."                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 12. ADMIN REVIEWS APPLICATION                               │
│     /management/admin/organisers                            │
│                                                             │
│     Admin can:                                              │
│     - View all pending organisers                           │
│     - Review submitted details                              │
│     - Verify documents                                      │
│     - Approve or Reject                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 13. ADMIN APPROVES ORGANISER                                │
│     convex.mutation(api.admin.approveOrganiser, {           │
│       organiserId: Id<"organisers">,                        │
│       adminId: Id<"users">                                  │
│     })                                                      │
│                                                             │
│     Updates `organisers` table:                             │
│     {                                                       │
│       approvalStatus: "approved",  ← UPDATED!               │
│       approvedBy: Id<"users">,                              │
│       approvedAt: timestamp                                 │
│     }                                                       │
│                                                             │
│     Updates Clerk metadata:                                 │
│     {                                                       │
│       status: "approved"  ← UPDATED!                        │
│     }                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 14. ORGANISER CAN ACCESS DASHBOARD                          │
│     /management/organiser/dashboard                         │
│                                                             │
│     Middleware checks:                                      │
│     - User is authenticated ✅                              │
│     - Role is "organiser" ✅                                │
│     - onboardingCompleted is true ✅                        │
│     - status is "approved" ✅                               │
│     → Grants access to organiser dashboard                  │
│                                                             │
│     Organiser can now:                                      │
│     - Create events                                         │
│     - Manage bookings                                       │
│     - View analytics                                        │
│     - Manage payouts                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Storage

### 1. **Clerk (Authentication)**

```typescript
// Stored in Clerk's publicMetadata
{
  role: "organiser",
  status: "pending" | "approved" | "rejected",
  onboardingCompleted: boolean
}
```

### 2. **Convex `users` Table**

```typescript
{
  _id: Id<"users">,
  clerkId: "user_abc123",
  email: "organiser@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+91 9876543210",
  role: "organiser",
  profileImage: "https://...",
  isActive: true,
  createdAt: 1703001234567,
  updatedAt: 1703001234567
}
```

### 3. **Convex `organisers` Table**

```typescript
{
  _id: Id<"organisers">,
  userId: Id<"users">,
  clerkId: "user_abc123",
  
  // Business Information
  institutionName: "ABC Events Pvt Ltd",
  address: {
    street: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001"
  },
  
  // Tax & Legal
  gstNumber: "29ABCDE1234F1Z5",
  panNumber: "ABCDE1234F",
  tanNumber: "MUMA12345D",  // Optional
  
  // Bank Details
  bankDetails: {
    accountHolderName: "ABC Events Pvt Ltd",
    accountNumber: "1234567890",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branchName: "MG Road Branch"
  },
  
  // Documents (URLs to uploaded files)
  documents: {
    gstCertificate: "https://storage.../gst.pdf",
    panCard: "https://storage.../pan.pdf",
    cancelledCheque: "https://storage.../cheque.pdf",
    bankStatement: "https://storage.../statement.pdf"
  },
  
  // Approval Status
  approvalStatus: "pending" | "approved" | "rejected",
  approvedBy: Id<"users">,  // Admin who approved
  approvedAt: 1703001234567,
  rejectionReason: "...",  // If rejected
  
  isActive: true,
  createdAt: 1703001234567,
  updatedAt: 1703001234567
}
```

---

## 🔐 Middleware Protection

The middleware (`src/middleware.ts`) enforces the flow:

```typescript
// Organiser routing logic
if (role === 'organiser' && userId) {
  // Not onboarded → redirect to onboarding
  if (!onboardingCompleted && !isOnboardingRoute(req)) {
    return NextResponse.redirect('/management/onboarding');
  }
  
  // Onboarded but pending → redirect to pending approval
  if (onboardingCompleted && status === 'pending' && !isPendingApprovalRoute(req)) {
    return NextResponse.redirect('/management/pending-approval');
  }
  
  // Approved → allow access to dashboard
  if (status === 'approved' && isPendingApprovalRoute(req)) {
    return NextResponse.redirect('/management/organiser/dashboard');
  }
}
```

---

## 📁 Key Files

### **Sign-Up Page**
`src/app/management/sign-up/[[...sign-up]]/page.tsx`
- Clerk SignUp component
- Sets `unsafeMetadata` with role
- Redirects to `/management/onboarding`

### **Onboarding Page**
`src/app/management/onboarding/page.tsx`
- Collects organiser details
- Uploads documents
- Creates organiser record in Convex

### **Clerk Webhook**
`src/app/api/webhooks/clerk/route.ts`
- Listens for `user.created` event
- Syncs user to Convex `users` table
- Checks for existing organisers

### **Middleware**
`src/middleware.ts`
- Enforces role-based routing
- Redirects based on onboarding/approval status

### **Convex Schema**
`convex/schema.ts`
- Defines `users` table structure
- Defines `organisers` table structure

### **Convex Mutations**
`convex/management.ts`
- `createOrganiser` - Creates organiser record
- `updateOrganiser` - Updates organiser details
- `checkOrganiserByEmail` - Checks existing organisers

---

## ✅ Summary

**The system already does exactly what you requested:**

1. ✅ **User signs up with Clerk** → Clerk stores user with role metadata
2. ✅ **Clerk webhook fires** → Syncs user to Convex `users` table
3. ✅ **User redirected to onboarding** → Collects detailed organiser information
4. ✅ **Onboarding form submitted** → Creates record in Convex `organisers` table with Clerk ID
5. ✅ **Approval workflow** → Admin reviews and approves/rejects
6. ✅ **Access granted** → Approved organisers can access dashboard

**No changes needed!** The flow is already fully implemented and working.

---

## 🎯 Next Steps (If Needed)

If you want to add additional features:

1. **Email Notifications** - Notify organisers when approved/rejected
2. **Document Verification** - Add admin tools to verify uploaded documents
3. **Auto-Approval** - Auto-approve organisers with verified GST numbers
4. **Profile Editing** - Allow organisers to update their details
5. **Multi-Role Support** - Allow users to have multiple roles (organiser + vendor)

---

**Status:** ✅ FULLY IMPLEMENTED AND WORKING
