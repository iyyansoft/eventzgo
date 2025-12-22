// src/hooks/useOrganiserSync.ts - Client-side hook to sync existing organisers
"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';

export function useOrganiserSync() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [synced, setSynced] = useState(false);

    // Check if this user is an organiser in Convex
    const organiserProfile = useQuery(
        api.organisers.getOrganiserByClerkId,
        user?.id ? { clerkId: user.id } : "skip"
    );

    const syncOrganiserApproval = useAction(api.clerk.syncOrganiserApproval);

    useEffect(() => {
        async function autoSyncOrganiser() {
            if (!isLoaded || !user || synced) return;

            const metadata = user.publicMetadata as any;
            const role = metadata?.role;

            // Only run for organisers
            if (role !== 'organiser') return;

            // If organiser profile exists in Convex
            if (organiserProfile) {
                const convexStatus = organiserProfile.approvalStatus;
                const clerkStatus = metadata?.status;
                const clerkOnboarding = metadata?.onboardingCompleted;

                // Check if Clerk metadata needs to be synced
                const needsSync =
                    convexStatus === 'approved' && (
                        clerkStatus !== 'approved' ||
                        clerkOnboarding !== true
                    );

                if (needsSync) {
                    console.log('🔄 Auto-syncing organiser approval to Clerk...');

                    try {
                        const result = await syncOrganiserApproval({ clerkId: user.id });

                        if (result.success) {
                            console.log('✅ Auto-sync successful!');
                            setSynced(true);

                            // Reload user to get updated metadata
                            await user.reload();

                            // Redirect to dashboard
                            router.push('/management/organiser/dashboard');
                        } else {
                            console.warn('⚠️ Auto-sync partial:', result.message);
                        }
                    } catch (error) {
                        console.error('❌ Auto-sync error:', error);
                    }
                }
            }
        }

        autoSyncOrganiser();
    }, [isLoaded, user, organiserProfile, synced, syncOrganiserApproval, router]);

    return {
        isLoaded,
        user,
        organiserProfile
    };
}