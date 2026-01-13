import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, value, options = {} } = body;

        if (!name || value === undefined) {
            return NextResponse.json(
                { error: 'Cookie name and value are required' },
                { status: 400 }
            );
        }

        const response = NextResponse.json({ success: true });

        // Set cookie with options
        response.cookies.set(name, value, {
            httpOnly: options.httpOnly ?? false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: options.sameSite ?? 'lax',
            maxAge: options.maxAge,
            path: options.path ?? '/',
            domain: options.domain,
        });

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to set cookie' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            // Return all cookies
            const cookies: Record<string, string> = {};
            request.cookies.getAll().forEach((cookie) => {
                cookies[cookie.name] = cookie.value;
            });
            return NextResponse.json({ cookies });
        }

        // Return specific cookie
        const value = request.cookies.get(name)?.value;
        return NextResponse.json({ name, value: value ?? null });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to get cookie' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: 'Cookie name is required' },
                { status: 400 }
            );
        }

        const response = NextResponse.json({ success: true });
        response.cookies.delete(name);

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to delete cookie' },
            { status: 500 }
        );
    }
}
