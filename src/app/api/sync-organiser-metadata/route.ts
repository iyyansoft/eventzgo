// src/app/api/sync-organiser-metadata/route.ts - Update Clerk metadata for synced organisers
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
    try {
        const { clerkId } = await req.json();

        if (!clerkId) {
            return NextResponse.json(
                { error: 'Clerk ID is required' },
                { status: 400 }
            );
        }

        // Get organiser status from Convex
        const organiserStatus = await convex.query(api.management.getOrganiserStatus, {
            clerkId
        });

        if (!organiserStatus) {
            return NextResponse.json(
                { error: 'Organiser not found' },
                { status: 404 }
            );
        }

        // Update Clerk metadata
        // Update Clerk metadata
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                role: 'organiser',
                status: organiserStatus.status,
                onboardingCompleted: true
            }
        });

        return NextResponse.json({
            success: true,
            metadata: {
                role: 'organiser',
                status: organiserStatus.status,
                onboardingCompleted: true
            }
        });

    } catch (error) {
        console.error('Error updating Clerk metadata:', error);
        return NextResponse.json(
            { error: 'Failed to update metadata' },
            { status: 500 }
        );
    }
}