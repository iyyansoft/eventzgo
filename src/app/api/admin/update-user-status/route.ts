import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function POST(req: NextRequest) {
    try {
        const { clerkId, status } = await req.json();

        if (!clerkId || !status) {
            return NextResponse.json(
                { error: 'Missing clerkId or status' },
                { status: 400 }
            );
        }

        // Update user's public metadata in Clerk
        await clerkClient.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                status: status,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating Clerk metadata:', error);
        return NextResponse.json(
            { error: 'Failed to update user status' },
            { status: 500 }
        );
    }
}
