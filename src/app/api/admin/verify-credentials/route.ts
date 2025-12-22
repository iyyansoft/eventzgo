import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Default admin credentials (in production, store these securely in environment variables)
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
};

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Verify credentials
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Store username in cookie for auth code verification
            const cookieStore = await cookies();
            cookieStore.set('admin_temp_username', username, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 300, // 5 minutes
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid username or password' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Error verifying credentials:', error);
        return NextResponse.json(
            { error: 'An error occurred during authentication' },
            { status: 500 }
        );
    }
}
