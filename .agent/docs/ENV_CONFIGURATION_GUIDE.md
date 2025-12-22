# Environment Configuration Guide

## 🔧 Recommended `.env.local` Configuration

### Current Issue
Your `.env.local` has **global redirect URLs** that conflict with component-level redirects:

```env
# ❌ PROBLEMATIC - These override component redirects
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### The Problem
When these are set globally:
- **End users** signing in at `/sign-in` → ✅ Correctly go to `/`
- **Management users** signing in at `/management/sign-in` → ❌ Incorrectly go to `/` instead of `/management`
- **Management sign-ups** → ❌ Go to `/` instead of `/management/onboarding`

---

## ✅ Solution: Remove Global Redirects

### Recommended Configuration

```env
# ============================================
# CLERK AUTHENTICATION
# ============================================

# Required: Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Required: Webhook Secret
CLERK_WEBHOOK_SECRET=whsec_xxx

# ❌ REMOVE THESE LINES - Let components handle redirects
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
# NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
# NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# ============================================
# OTHER SERVICES (Keep these as-is)
# ============================================

# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=xxx

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Resend Email
RESEND_API_KEY=re_xxx

# Other configurations...
```

---

## 📝 What to Change

### Step 1: Open `.env.local`
Located at: `c:\Users\Cibisuryaa S\eventzgo\.env.local`

### Step 2: Comment Out or Remove These Lines

Find and **comment out** (add `#` at the start) or **delete** these lines:

```env
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
# NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
# NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Step 3: Keep These Lines (Required)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
```

### Step 4: Restart Development Server

After making changes:
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## 🎯 Why This Works

### Component-Level Control

Each authentication page now controls its own redirects:

#### End User Sign-In (`/sign-in/page.tsx`)
```tsx
<SignIn
    afterSignInUrl="/"      // ← Redirects to homepage
    redirectUrl="/"
    signUpUrl="/sign-up"
/>
```

#### Management Sign-In (`/management/sign-in/page.tsx`)
```tsx
<SignIn
    redirectUrl="/management"  // ← Redirects to management
    signUpUrl="/management/sign-up"
/>
```

#### End User Sign-Up (`/sign-up/page.tsx`)
```tsx
<SignUp
    afterSignUpUrl="/"      // ← Redirects to homepage
    redirectUrl="/"
    signInUrl="/sign-in"
    unsafeMetadata={{
        role: "attendee",   // ← Sets role
    }}
/>
```

#### Management Sign-Up (`/management/sign-up/page.tsx`)
```tsx
<SignUp
    afterSignUpUrl="/management/onboarding"  // ← Redirects to onboarding
    redirectUrl="/management/onboarding"
    signInUrl="/management/sign-in"
    unsafeMetadata={{
        role: role,         // ← Sets role (organiser, vendor, etc.)
    }}
/>
```

### Middleware Takes Over

After initial redirect, middleware handles further routing based on:
- User role (`attendee`, `organiser`, `admin`)
- Onboarding status (`onboardingCompleted`)
- Approval status (`pending`, `approved`, `rejected`)

---

## 🧪 Testing After Changes

### Test 1: End User Sign-Up
1. Visit `http://localhost:3000/sign-up`
2. Sign up with a new email
3. **Expected:** Redirect to `/` (homepage)
4. **Check:** User has `role: "attendee"` in Clerk metadata

### Test 2: Management Sign-Up
1. Visit `http://localhost:3000/management`
2. Click "Sign Up as Organiser"
3. Complete sign-up form
4. **Expected:** Redirect to `/management/onboarding`
5. **Check:** User has `role: "organiser"` in Clerk metadata

### Test 3: Management Sign-In (Existing Organiser)
1. Sign in at `/management/sign-in`
2. **Expected:** 
   - If onboarding not completed → `/management/onboarding`
   - If pending approval → `/management/pending-approval`
   - If approved → `/management/organiser/dashboard`

### Test 4: End User Blocked from Management
1. Sign in as end user at `/sign-in`
2. Try to visit `/management/organiser/dashboard`
3. **Expected:** Blocked and redirected to `/management/blocked`

---

## 🔍 Verification Checklist

After making changes, verify:

- [ ] Removed or commented out global Clerk redirect URLs
- [ ] Kept required Clerk keys (publishable, secret, webhook)
- [ ] Restarted development server
- [ ] End user sign-up redirects to `/`
- [ ] Management sign-up redirects to `/management/onboarding`
- [ ] End users blocked from management routes
- [ ] Middleware routing works based on role/status

---

## 📚 Related Documentation

- **Authentication Flow:** `.agent/docs/AUTHENTICATION_FLOW.md`
- **Middleware Logic:** `src/middleware.ts`
- **Clerk Documentation:** https://clerk.com/docs

---

## 🆘 Troubleshooting

### Issue: Changes not taking effect
**Solution:** Restart the dev server completely
```bash
# Stop: Ctrl+C
# Start: npm run dev
```

### Issue: Still redirecting to wrong page
**Solution:** 
1. Clear browser cache and cookies
2. Check if `.env.local` changes were saved
3. Verify no other `.env` files exist (`.env`, `.env.production`)

### Issue: Environment variables not loading
**Solution:**
1. Ensure `.env.local` is in the root directory
2. Restart Next.js dev server
3. Check for syntax errors in `.env.local` (no spaces around `=`)

---

## 💡 Pro Tips

1. **Never commit `.env.local`** - It's in `.gitignore` for security
2. **Use `.env.example`** - Create a template for other developers
3. **Document custom variables** - Add comments in `.env.local`
4. **Restart after changes** - Environment variables load on server start

---

## ✅ Final Configuration

Your `.env.local` should look like this:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=xxx

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Email Service
RESEND_API_KEY=re_xxx

# Other services...
```

**That's it!** No Clerk redirect URLs needed. Components handle everything.
