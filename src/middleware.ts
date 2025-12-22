// src/middleware.ts - Enhanced middleware with end-user blocking
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)', // Allow SSO callback
  '/management',
  '/management/blocked(.*)', // Blocked user page with wildcard
  '/management/sign-in(.*)', // Management sign-in
  '/management/sign-up(.*)', // Management sign-up
  '/management/sso-callback(.*)', // Management SSO callback
  '/admin/login(.*)', // Admin login (custom auth)
  '/events(.*)',
  '/all-events(.*)',
  '/category/(.*)',
  '/state/(.*)',
  '/search',
  '/api/webhooks/(.*)',
  '/api/razorpay/(.*)',
  '/api/admin/verify-credentials', // Admin credential verification
  '/api/admin/verify-auth-code', // Admin auth code verification
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/booking/(.*)/checkout',
  '/booking/(.*)/success',
  '/my-bookings(.*)',
]);

// Define organiser-only routes
const isOrganiserRoute = createRouteMatcher([
  '/management/organiser(.*)',
]);

// Define admin-only routes (management admin)
const isAdminRoute = createRouteMatcher([
  '/management/admin(.*)',
]);

// Define admin portal routes
const isAdminPortalRoute = createRouteMatcher([
  '/admin/dashboard(.*)',
  '/admin/users(.*)',
  '/admin/events(.*)',
  '/admin/analytics(.*)',
  '/admin/system(.*)',
]);

// Define management onboarding routes - Make public for initial redirect
const isOnboardingRoute = createRouteMatcher([
  '/management/onboarding(.*)',
]);

// Define pending approval route
const isPendingApprovalRoute = createRouteMatcher([
  '/management/pending-approval(.*)',
]);

// Define any management route (except landing and blocked page)
const isAnyManagementRoute = createRouteMatcher([
  '/management/organiser(.*)',
  '/management/admin(.*)',
  '/management/onboarding(.*)',
  '/management/pending-approval(.*)',
  '/management/sign-in(.*)',
  '/management/sign-up(.*)',
]);

// Define management routes that should BLOCK end users (excludes sign-up)
const isManagementRouteBlockedForEndUsers = createRouteMatcher([
  '/management/organiser(.*)',
  '/management/admin(.*)',
  '/management/onboarding(.*)',
  '/management/pending-approval(.*)',
  '/management/sign-in(.*)',  // Block end users from signing in
  // Note: sign-up is NOT included - anyone can sign up
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // Check for admin portal routes - use custom JWT authentication
  if (isAdminPortalRoute(req)) {
    const adminSession = req.cookies.get('admin_session')?.value;

    if (!adminSession) {
      // No admin session, redirect to admin login
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Verify admin JWT token
    try {
      const { jwtVerify } = await import('jose');
      const JWT_SECRET = new TextEncoder().encode(
        process.env.ADMIN_JWT_SECRET || 'your-secret-key-change-this-in-production'
      );
      const { payload } = await jwtVerify(adminSession, JWT_SECRET);

      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // Valid admin session, allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // Get user metadata
  const publicMetadata = (sessionClaims?.public_metadata as Record<string, any>) || {};
  const role = publicMetadata.role || 'user';
  const status = publicMetadata.status || 'active';
  const onboardingCompleted = publicMetadata.onboardingCompleted || false;

  // Debug logging for organiser routing
  if (role === 'organiser') {
    console.log('🔍 Middleware - Organiser detected:', {
      userId,
      role,
      status,
      onboardingCompleted,
      pathname,
      publicMetadata
    });
  }

  // Allow public routes (including onboarding for new sign-ups)
  if (isPublicRoute(req) || isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // ===== BLOCK END USERS FROM MANAGEMENT PORTAL (EXCEPT SIGN-UP) =====
  // TEMPORARILY DISABLED - Allow all users to access management portal for testing
  // If a regular end user (role="user" or "attendee") tries to access management routes
  // EXCEPT sign-up pages (they should be able to sign up for management roles)

  /* COMMENTED OUT FOR TESTING
  if (userId && (role === 'user' || role === 'attendee') && isManagementRouteBlockedForEndUsers(req)) {
    // Sign out the user and redirect to blocked page
    const response = NextResponse.redirect(new URL('/management/blocked', req.url));

    // Clear Clerk session by redirecting through sign-out
    const signOutUrl = new URL('/api/auth/sign-out', req.url);
    signOutUrl.searchParams.set('redirect_url', '/management/blocked');

    return NextResponse.redirect(signOutUrl);
  }
  */

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ===== ORGANISER ROUTING LOGIC (TEMPORARILY DISABLED) =====
  /*
  if (role === 'organiser' && userId) {
    // Step 1: Force to onboarding if not completed (except if already on onboarding page)
    if (!onboardingCompleted && !isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/management/onboarding', req.url));
    }

    // Step 2: Force to pending approval if status is pending (except if already on pending page)
    if (onboardingCompleted && status === 'pending' && !isPendingApprovalRoute(req)) {
      return NextResponse.redirect(new URL('/management/pending-approval', req.url));
    }

    // Step 3: Redirect from pending to dashboard if approved
    if (status === 'approved' && isPendingApprovalRoute(req)) {
      return NextResponse.redirect(new URL('/management/organiser/dashboard', req.url));
    }

    // Step 4: Block admin routes for organisers
    if (isAdminRoute(req)) {
      return NextResponse.redirect(new URL('/management/organiser/dashboard', req.url));
    }

    // Step 5: Redirect base management and sign-in to organiser dashboard if approved
    if ((pathname === '/management' || pathname.startsWith('/management/sign-in')) && status === 'approved') {
      return NextResponse.redirect(new URL('/management/organiser/dashboard', req.url));
    }

    // Step 6: Handle rejected status
    if (status === 'rejected' && !isPendingApprovalRoute(req)) {
      return NextResponse.redirect(new URL('/management/pending-approval', req.url));
    }

    // Step 7: Handle suspended status
    if (status === 'suspended') {
      return NextResponse.redirect(new URL('/management', req.url));
    }
  }
  */

  // Protect organiser routes (TEMPORARILY DISABLED)
  /*
  if (isOrganiserRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/management/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Must be organiser or admin
    if (role !== 'organiser' && role !== 'admin') {
      return NextResponse.redirect(new URL('/management', req.url));
    }

    // Organiser must be approved
    if (role === 'organiser' && status !== 'approved') {
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL('/management/onboarding', req.url));
      }
      if (status === 'pending') {
        return NextResponse.redirect(new URL('/management/pending-approval', req.url));
      }
      return NextResponse.redirect(new URL('/management', req.url));
    }
  }
  */

  // ===== ADMIN ROUTING LOGIC =====
  if (role === 'admin' && userId) {
    // Redirect base management to admin dashboard
    if (pathname === '/management') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // Block organiser routes for admins (redirect to admin dashboard)
    if (isOrganiserRoute(req)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // Block onboarding and pending routes for admins
    if (isOnboardingRoute(req) || isPendingApprovalRoute(req)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  // Protect admin routes (requires admin role)
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/management/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/management', req.url));
    }
  }

  // Protect admin portal routes (requires admin role)
  if (isAdminPortalRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/admin/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect onboarding route (only for organisers who haven't completed onboarding)
  // NOTE: Onboarding is now public to allow Clerk redirect, but the page itself checks auth
  /* 
  if (isOnboardingRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/management/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Only organisers can access onboarding
    if (role !== 'organiser') {
      return NextResponse.redirect(new URL('/management', req.url));
    }

    // If already completed onboarding, redirect based on status
    if (onboardingCompleted) {
      if (status === 'approved') {
        return NextResponse.redirect(new URL('/management/organiser/dashboard', req.url));
      }
      if (status === 'pending') {
        return NextResponse.redirect(new URL('/management/pending-approval', req.url));
      }
    }
  }
  */

  // Protect pending approval route (only for organisers with pending status)
  if (isPendingApprovalRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/management/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Only organisers can access pending approval
    if (role !== 'organiser') {
      return NextResponse.redirect(new URL('/management', req.url));
    }

    // If not completed onboarding, redirect to onboarding
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL('/management/onboarding', req.url));
    }

    // If approved, redirect to dashboard
    if (status === 'approved') {
      return NextResponse.redirect(new URL('/management/organiser/dashboard', req.url));
    }
  }

  // Default: allow the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};