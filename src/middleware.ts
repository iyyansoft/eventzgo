// src/middleware.ts - Enhanced middleware with NextAuth support for organisers
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/management',
  '/management/blocked(.*)',
  '/management/sign-in(.*)', // NextAuth organiser sign-in
  '/management/sign-up(.*)',
  '/management/onboarding(.*)', // Allow onboarding access
  '/management/sso-callback(.*)',
  '/admin/login(.*)',
  '/events(.*)',
  '/all-events(.*)',
  '/category/(.*)',
  '/state/(.*)',
  '/search',
  '/api/webhooks/(.*)',
  '/api/razorpay/(.*)',
  '/api/admin/verify-credentials',
  '/api/admin/verify-auth-code',
  '/api/auth/(.*)', // NextAuth API routes
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/booking/(.*)/checkout',
  '/booking/(.*)/success',
  '/my-bookings(.*)',
]);

// Define organiser-only routes (protected by NextAuth)
const isOrganiserRoute = createRouteMatcher([
  '/management/organiser(.*)',
]);

// Define admin-only routes (protected by Clerk)
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

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Skip Clerk middleware for NextAuth organiser routes and Admin Portal routes (handled by NextAuth)
  if (isOrganiserRoute(req) || isAdminPortalRoute(req) || pathname.startsWith('/api/auth')) {
    // These routes are handled by NextAuth
    // No Clerk authentication needed
    return NextResponse.next();
  }

  // Authenticate with Clerk
  const { userId, sessionClaims } = await auth();
  const publicMetadata = (sessionClaims?.public_metadata as Record<string, any>) || {};
  const role = publicMetadata.role || 'user';

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Check for admin portal routes - use Clerk authentication
  if (isAdminPortalRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/admin/login', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protect admin routes (requires admin role via Clerk)
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