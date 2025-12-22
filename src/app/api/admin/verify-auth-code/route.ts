import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

// Default auth code (in production, generate this dynamically or use TOTP)
const ADMIN_AUTH_CODE = process.env.ADMIN_AUTH_CODE || '123456';

// JWT secret for admin sessions
const JWT_SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function POST(req: NextRequest) {
    try {
        const { username, authCode } = await req.json();

        if (!username || !authCode) {
            return NextResponse.json(
                { error: 'Username and auth code are required' },
                { status: 400 }
            );
        }

        // Verify the temp username cookie exists
        const cookieStore = await cookies();
        const tempUsername = cookieStore.get('admin_temp_username')?.value;

        if (!tempUsername || tempUsername !== username) {
            return NextResponse.json(
                { error: 'Invalid session. Please sign in again.' },
                { status: 401 }
            );
        }

        // Verify auth code
        if (authCode === ADMIN_AUTH_CODE) {
            // Create JWT token for admin session
            const token = await new SignJWT({ username, role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(JWT_SECRET);

            // Set admin session cookie
            cookieStore.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 86400, // 24 hours
            });

            // Clear temp username cookie
            cookieStore.delete('admin_temp_username');

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid authentication code' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Error verifying auth code:', error);
        return NextResponse.json(
            { error: 'An error occurred during authentication' },
            { status: 500 }
        );
    }
}
