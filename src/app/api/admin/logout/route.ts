import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Clear admin session cookie
        cookieStore.delete('admin_session');
        cookieStore.delete('admin_temp_username');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json(
            { error: 'An error occurred during logout' },
            { status: 500 }
        );
    }
}
