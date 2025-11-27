import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Get the pathname
  const pathname = url.pathname;

  // Check for subdomains
  const isAdminSubdomain = hostname.startsWith('admin.');
  const isOrganizerSubdomain = hostname.startsWith('organizer.') || hostname.startsWith('organiser.');

  // Admin subdomain routing
  if (isAdminSubdomain) {
    // Redirect root to admin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Ensure all requests go to admin routes
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL(`/admin${pathname}`, request.url));
    }
  }

  // Organizer subdomain routing
  if (isOrganizerSubdomain) {
    // Redirect root to organizer dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/management/organiser/dashboard', request.url));
    }

    // Ensure all requests go to management/organiser routes
    if (!pathname.startsWith('/management/organiser') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL(`/management/organiser${pathname}`, request.url));
    }
  }

  // Main domain - block access to admin and organizer routes
  if (!isAdminSubdomain && !isOrganizerSubdomain) {
    // Redirect admin routes to admin subdomain
    if (pathname.startsWith('/admin')) {
      const adminUrl = new URL(request.url);
      adminUrl.hostname = `admin.${hostname}`;
      adminUrl.pathname = pathname.replace('/admin', '');
      return NextResponse.redirect(adminUrl);
    }

    // Redirect organizer routes to organizer subdomain
    if (pathname.startsWith('/management/organiser')) {
      const organizerUrl = new URL(request.url);
      organizerUrl.hostname = `organizer.${hostname}`;
      organizerUrl.pathname = pathname.replace('/management/organiser', '');
      return NextResponse.redirect(organizerUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};