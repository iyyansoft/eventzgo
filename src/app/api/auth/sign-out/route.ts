
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect_url') || '/';

    // Create response with redirect
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Clear Clerk session cookie
    response.cookies.delete('__session');
    response.cookies.delete('__clerk_db_jwt');

    return response;
}