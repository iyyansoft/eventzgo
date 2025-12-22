# EventzGo Authentication Flow

## Overview

EventzGo uses **one Clerk authentication instance** for both end users and management users. The separation is achieved through **role-based metadata** and **middleware routing**.

---

## 🔑 Single Authentication Key Strategy

### Why One Key?
- ✅ Simpler architecture
- ✅ Lower cost (one Clerk subscription)
- ✅ Users can have multiple roles
- ✅ Centralized user management

### How It Prevents Confusion
The system uses **three layers of separation**:

1. **Metadata Layer** - Clerk `publicMetadata.role`
2. **Middleware Layer** - Route protection and redirection
3. **UI Layer** - Separate sign-in/sign-up pages

---

## 👥 User Types & Roles

### End Users (Attendees)
```typescript
{
  role: "attendee",
  status: "approved",
  onboardingCompleted: true
}
```

**Access:**
- ✅ Homepage, events, bookings
- ✅ Profile management
- ❌ Management portal (blocked by middleware)

**Authentication Flow:**
1. Visit `/sign-in` or `/sign-up`
2. Complete Clerk authentication
3. Metadata set to `role: "attendee"`
4. Redirect to `/` (homepage)
5. Can browse and book events

---

### Management Users (Organizers, Vendors, Speakers, Sponsors)

```typescript
{
  role: "organiser" | "vendor" | "speaker" | "sponsor",
  status: "pending" | "approved" | "rejected" | "suspended",
  onboardingCompleted: false | true
}
```

**Access:**
- ✅ Management dashboard
- ✅ Event creation and management
- ✅ Analytics and reports
- ❌ End user pages (can access but redirected)

**Authentication Flow:**
1. Visit `/management` landing page
2. Select role (organiser, vendor, etc.)
3. Click "Sign Up" → Redirected to `/management/sign-up?role=organiser`
4. Complete Clerk authentication
5. Metadata set to `role: "organiser"`, `status: "pending"`, `onboardingCompleted: false`
6. Redirect to `/management/onboarding`
7. Complete onboarding form
8. Redirect to `/management/pending-approval`
9. Admin approves → Access `/management/organiser/dashboard`

---

### Admin Users

```typescript
{
  role: "admin",
  status: "approved",
  onboardingCompleted: true
}
```

**Access:**
- ✅ Full management portal access
- ✅ Admin dashboard
- ✅ Approve/reject organizers
- ✅ System configuration

---

## 🛡️ Middleware Protection

**File:** `src/middleware.ts`

### Key Protection Rules:

#### 1. Block End Users from Management
```typescript
// Lines 75-86
if (userId && role === 'user' && isAnyManagementRoute(req)) {
    // Sign out and redirect to blocked page
    return NextResponse.redirect(new URL('/management/blocked', req.url));
}
```

#### 2. Organiser Routing Logic
```typescript
// Step 1: Force to onboarding if not completed
if (!onboardingCompleted && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/management/onboarding', req.url));
}

// Step 2: Force to pending approval if status is pending
if (onboardingCompleted && status === 'pending' && !isPendingApprovalRoute(req)) {
    return NextResponse.redirect(new URL('/management/pending-approval', req.url));
}

// Step 3: Redirect to dashboard if approved
if (status === 'approved' && isPendingApprovalRoute(req)) {
    return NextResponse.redirect(new URL('/management/organiser/dashboard', req.url));
}
```

#### 3. Admin Routing Logic
```typescript
// Redirect base management to admin dashboard
if (pathname === '/management' && role === 'admin') {
    return NextResponse.redirect(new URL('/management/admin/dashboard', req.url));
}
```

---

## 🚪 Authentication Pages

### End User Authentication

#### Sign In: `/sign-in`
```tsx
<SignIn
    afterSignInUrl="/"
    redirectUrl="/"
    signUpUrl="/sign-up"
/>
```

#### Sign Up: `/sign-up`
```tsx
<SignUp
    afterSignUpUrl="/"
    redirectUrl="/"
    signInUrl="/sign-in"
    unsafeMetadata={{
        role: "attendee",
        status: "approved",
        onboardingCompleted: true,
    }}
/>
```

---

### Management Authentication

#### Sign In: `/management/sign-in`
```tsx
<SignIn
    redirectUrl="/management"
    signUpUrl="/management/sign-up"
/>
```
**Note:** After sign-in, middleware routes based on role and status.

#### Sign Up: `/management/sign-up`
```tsx
<SignUp
    afterSignUpUrl="/management/onboarding"
    redirectUrl="/management/onboarding"
    signInUrl="/management/sign-in"
    unsafeMetadata={{
        role: role, // From URL param: ?role=organiser
        status: role === "admin" ? "approved" : "pending",
        onboardingCompleted: false,
    }}
/>
```

---

## 🔄 Webhook Integration

**File:** `src/app/api/webhooks/clerk/route.ts`

### User Creation/Update Flow

```typescript
if (eventType === "user.created" || eventType === "user.updated") {
    // Step 1: Sync user to Convex
    await convex.mutation(api.users.syncUser, {
        clerkId: id,
        email: email,
        firstName: first_name,
        lastName: last_name,
        // ...
    });

    // Step 2: Check if organiser sign-up
    if (eventType === "user.created" && metadata?.role === "organiser") {
        // Check for existing organiser in Convex
        const existingOrganiser = await convex.query(
            api.management.checkOrganiserByEmail,
            { email: email }
        );

        // Sync Clerk ID if organiser exists
        if (existingOrganiser && !existingOrganiser.hasClerkId) {
            await convex.mutation(
                api.management.syncExistingOrganiserWithClerk,
                { email: email, clerkId: id }
            );
        }
    }
}
```

---

## ⚙️ Environment Configuration

### Required Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# ❌ REMOVE THESE - Let component-level redirects handle it
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
# NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
# NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Why Remove Global Redirects?

**Problem:**
Global redirect URLs in `.env.local` override component-level `redirectUrl` props, causing:
- Management users redirected to homepage instead of onboarding
- End users potentially redirected to wrong pages

**Solution:**
Remove global redirects and let each sign-in/sign-up component handle its own redirects:
- End user pages → `/`
- Management pages → `/management` or `/management/onboarding`

---

## 🔍 Testing the Flow

### Test End User Flow
1. Visit `http://localhost:3000/sign-up`
2. Sign up with email
3. Should redirect to `/` (homepage)
4. Try accessing `/management/organiser/dashboard`
5. Should be blocked and redirected

### Test Management Flow
1. Visit `http://localhost:3000/management`
2. Click "Sign Up as Organiser"
3. Complete sign-up
4. Should redirect to `/management/onboarding`
5. Complete onboarding
6. Should redirect to `/management/pending-approval`
7. Admin approves
8. Should access `/management/organiser/dashboard`

---

## 🐛 Common Issues & Solutions

### Issue: Users redirected to wrong page after sign-in
**Cause:** Global redirect URLs in `.env.local`
**Solution:** Remove `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` and similar variables

### Issue: End users can access management portal
**Cause:** Middleware not blocking properly
**Solution:** Check middleware role detection and blocking logic (lines 75-86)

### Issue: Organizers stuck in onboarding loop
**Cause:** Metadata not updated after onboarding
**Solution:** Ensure onboarding completion updates `onboardingCompleted: true`

### Issue: Role not set during sign-up
**Cause:** `unsafeMetadata` not passed to Clerk component
**Solution:** Verify `unsafeMetadata` prop in SignUp components

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Visits EventzGo                      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐    ┌────────▼────────┐
        │  End User Path │    │ Management Path │
        │   /sign-up     │    │   /management   │
        └───────┬────────┘    └────────┬────────┘
                │                      │
        ┌───────▼────────┐    ┌────────▼─────────────┐
        │ Clerk Sign Up  │    │ Select Role          │
        │ role: attendee │    │ (organiser/vendor)   │
        └───────┬────────┘    └────────┬─────────────┘
                │                      │
        ┌───────▼────────┐    ┌────────▼──────────────┐
        │ Redirect to /  │    │ /management/sign-up   │
        │   (Homepage)   │    │ role: organiser       │
        └───────┬────────┘    └────────┬──────────────┘
                │                      │
        ┌───────▼────────┐    ┌────────▼──────────────┐
        │ Browse Events  │    │ /management/onboarding│
        │ Book Tickets   │    └────────┬──────────────┘
        └────────────────┘             │
                                ┌──────▼───────────────┐
                                │ Complete Onboarding  │
                                └──────┬───────────────┘
                                       │
                                ┌──────▼───────────────┐
                                │ Pending Approval     │
                                └──────┬───────────────┘
                                       │
                                ┌──────▼───────────────┐
                                │ Admin Approves       │
                                └──────┬───────────────┘
                                       │
                                ┌──────▼───────────────┐
                                │ Organiser Dashboard  │
                                └──────────────────────┘
```

---

## 🎯 Summary

**One Clerk Key + Role Metadata = Secure Separation**

The system successfully separates end users and management users through:

1. ✅ **Metadata** - Different roles stored in Clerk
2. ✅ **Middleware** - Enforces access control
3. ✅ **Component Redirects** - Each auth page handles its own flow
4. ✅ **Webhooks** - Syncs data to Convex database

**No confusion occurs** because the role metadata acts as the differentiator within the single authentication instance.
