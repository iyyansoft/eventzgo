// convex/verificationStaff.ts
// Verification Staff Management - Create and manage event staff
// Force sync timestamp: 2026-01-11 (Updated schema and logic)

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as bcrypt from "bcryptjs";

/**
 * Generate unique username for staff
 */
function generateStaffUsername(staffName: string, eventId: string): string {
    const namePart = staffName.toLowerCase().replace(/\s+/g, '_').substring(0, 10);
    const eventPart = eventId.substring(eventId.length - 6);
    return `${namePart}_${eventPart}`;
}

/**
 * Generate temporary password
 */
function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const special = '@#$%';
    let password = '';

    // 8 random characters
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add one special character
    password += special.charAt(Math.floor(Math.random() * special.length));

    // Add one number
    password += Math.floor(Math.random() * 10);

    return password;
}

/**
 * Create verification staff account
 */
export const createVerificationStaff = mutation({
    args: {
        organiserId: v.id("organisers"),
        eventId: v.optional(v.id("events")), // Optional - null means all events
        staffName: v.string(),
        staffEmail: v.string(),
        staffPhone: v.string(),
        role: v.union(
            v.literal("scanner"),
            v.literal("manager"),
            v.literal("admin")
        ),
    },
    handler: async (ctx, args) => {
        console.log("👤 Creating verification staff...");

        // Verify organiser exists
        const organiser = await ctx.db.get(args.organiserId);
        if (!organiser) {
            throw new Error("Organiser not found");
        }

        // If eventId provided, verify event belongs to organiser
        if (args.eventId) {
            const event = await ctx.db.get(args.eventId);
            if (!event || event.organiserId !== args.organiserId) {
                throw new Error("Event not found or doesn't belong to this organiser");
            }
        }

        // Generate credentials
        const username = generateStaffUsername(args.staffName, args.eventId || args.organiserId);
        const tempPassword = generateTempPassword();
        const passwordHash = bcrypt.hashSync(tempPassword, 12);

        // Set permissions based on role
        let permissions;
        switch (args.role) {
            case "scanner":
                permissions = {
                    canScanTickets: true,
                    canViewAnalytics: false,
                    canManageStaff: false,
                    canIssueRefunds: false,
                    canOverrideScans: false,
                };
                break;
            case "manager":
                permissions = {
                    canScanTickets: true,
                    canViewAnalytics: true,
                    canManageStaff: false,
                    canIssueRefunds: false,
                    canOverrideScans: true,
                };
                break;
            case "admin":
                permissions = {
                    canScanTickets: true,
                    canViewAnalytics: true,
                    canManageStaff: true,
                    canIssueRefunds: true,
                    canOverrideScans: true,
                };
                break;
        }

        // Create staff account
        const staffId = await ctx.db.insert("verificationStaff", {
            organiserId: args.organiserId,
            eventId: args.eventId,
            staffName: args.staffName,
            staffEmail: args.staffEmail,
            staffPhone: args.staffPhone,
            username,
            passwordHash,
            tempPassword,
            role: args.role,
            permissions,
            isActive: true,
            createdAt: Date.now(),
            createdBy: args.organiserId,
            updatedAt: Date.now(),
        });

        console.log("✅ Verification staff created!");

        return {
            success: true,
            staffId,
            credentials: {
                username,
                tempPassword,
                loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/login`,
            },
            message: "Staff account created successfully. Please share credentials securely.",
        };
    },
});

/**
 * Get all verification staff for an organiser
 */
export const getVerificationStaff = query({
    args: {
        organiserId: v.id("organisers"),
        eventId: v.optional(v.id("events")),
    },
    handler: async (ctx, args) => {
        let staff;

        if (args.eventId) {
            // Get staff for specific event
            staff = await ctx.db
                .query("verificationStaff")
                .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
                .filter((q) =>
                    q.or(
                        q.eq(q.field("eventId"), args.eventId),
                        q.eq(q.field("eventId"), undefined) // Include staff assigned to all events
                    )
                )
                .collect();
        } else {
            // Get all staff for organiser
            staff = await ctx.db
                .query("verificationStaff")
                .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
                .collect();
        }

        // Filter out deleted staff
        staff = staff.filter(s => !s.isDeleted);

        // Enrich with scan statistics
        const enrichedStaff = await Promise.all(
            staff.map(async (s) => {
                // Count scans by this staff member
                const scans = await ctx.db
                    .query("ticketScans")
                    .withIndex("by_scanner_id", (q) => q.eq("scannerId", s._id))
                    .collect();

                const validScans = scans.filter(scan => scan.scanResult === "valid").length;
                const invalidScans = scans.length - validScans;

                // Get event name if assigned to specific event
                let eventName;
                if (s.eventId) {
                    const event = await ctx.db.get(s.eventId);
                    eventName = event?.title;
                }

                return {
                    ...s,
                    passwordHash: undefined, // Don't expose password hash
                    eventName,
                    stats: {
                        totalScans: scans.length,
                        validScans,
                        invalidScans,
                    },
                };
            })
        );

        return enrichedStaff;
    },
});

/**
 * Staff login
 */
export const staffLogin = mutation({
    args: {
        username: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("🔐 Staff login attempt:", args.username);

        // Find staff by username
        const staff = await ctx.db
            .query("verificationStaff")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (!staff) {
            throw new Error("Invalid username or password");
        }

        // Check if active
        if (!staff.isActive) {
            throw new Error("Account is inactive. Please contact your organiser.");
        }

        // Verify password
        const passwordValid = bcrypt.compareSync(args.password, staff.passwordHash);
        if (!passwordValid) {
            throw new Error("Invalid username or password");
        }

        // Update last login
        await ctx.db.patch(staff._id, {
            lastLoginAt: Date.now(),
        });

        // Get event details if assigned
        let eventDetails;
        if (staff.eventId) {
            const event = await ctx.db.get(staff.eventId);
            eventDetails = {
                eventId: event?._id,
                title: event?.title,
                dateTime: event?.dateTime,
                venue: event?.venue,
            };
        }

        // Fetch organiser details
        const organiser = await ctx.db.get(staff.organiserId);

        console.log("✅ Staff login successful!");

        return {
            success: true,
            staff: {
                staffId: staff._id,
                staffName: staff.staffName,
                role: staff.role,
                permissions: staff.permissions,
                eventId: staff.eventId,
                organiserId: staff.organiserId,
                organiserName: organiser?.institutionName || "Unknown Organiser",
            },
            event: eventDetails,
        };
    },
});

/**
 * Update staff status (activate/deactivate)
 */
export const updateStaffStatus = mutation({
    args: {
        staffId: v.id("verificationStaff"),
        isActive: v.boolean(),
        updatedBy: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const staff = await ctx.db.get(args.staffId);
        if (!staff) {
            throw new Error("Staff not found");
        }

        // Verify updater is the organiser who created this staff
        if (staff.organiserId !== args.updatedBy) {
            throw new Error("You don't have permission to update this staff member");
        }

        await ctx.db.patch(args.staffId, {
            isActive: args.isActive,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: args.isActive ? "Staff activated" : "Staff deactivated",
        };
    },
});

/**
 * Reset staff password
 */
export const resetStaffPassword = mutation({
    args: {
        staffId: v.id("verificationStaff"),
        resetBy: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const staff = await ctx.db.get(args.staffId);
        if (!staff) {
            throw new Error("Staff not found");
        }

        // Verify resetter is the organiser
        if (staff.organiserId !== args.resetBy) {
            throw new Error("You don't have permission to reset this password");
        }

        // Generate new password
        const newPassword = generateTempPassword();
        const passwordHash = bcrypt.hashSync(newPassword, 12);

        await ctx.db.patch(args.staffId, {
            passwordHash,
            tempPassword: newPassword,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            newPassword,
            message: "Password reset successfully. Please share the new password securely.",
        };
    },
});

/**
 * Delete staff member
 */
export const deleteStaff = mutation({
    args: {
        staffId: v.id("verificationStaff"),
        deletedBy: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        const staff = await ctx.db.get(args.staffId);
        if (!staff) {
            throw new Error("Staff not found");
        }

        // Verify deleter is the organiser
        if (staff.organiserId !== args.deletedBy) {
            throw new Error("You don't have permission to delete this staff member");
        }

        // Soft delete - mark as deleted
        await ctx.db.patch(args.staffId, {
            isDeleted: true,
            isActive: false, // Also deactivate
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: "Staff member removed successfully",
        };
    },
});

/**
 * Get staff member by ID
 */
export const getStaffById = query({
    args: {
        staffId: v.id("verificationStaff"),
    },
    handler: async (ctx, args) => {
        const staff = await ctx.db.get(args.staffId);
        if (!staff) {
            return null;
        }

        // Get event details if assigned
        let eventDetails;
        if (staff.eventId) {
            const event = await ctx.db.get(staff.eventId);
            eventDetails = {
                eventId: event?._id,
                title: event?.title,
            };
        }

        return {
            ...staff,
            passwordHash: undefined, // Don't expose password
            event: eventDetails,
        };
    },
});

/**
 * Get events allowed for a staff member
 */
export const getStaffAllowedEvents = query({
    args: {
        staffId: v.id("verificationStaff"),
    },
    handler: async (ctx, args) => {
        const staff = await ctx.db.get(args.staffId);
        if (!staff) {
            throw new Error("Staff not found");
        }

        // If assigned to specific event, return only that
        if (staff.eventId) {
            const event = await ctx.db.get(staff.eventId);
            if (!event) return [];
            return [{
                _id: event._id,
                title: event.title,
                dateTime: event.dateTime,
                venue: event.venue
            }];
        }

        // If global staff, return all active events for the organiser
        const events = await ctx.db
            .query("events")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", staff.organiserId))
            .filter((q) => q.neq(q.field("status"), "draft")) // Only published/active events
            .collect();

        return events.map(e => ({
            _id: e._id,
            title: e.title,
            dateTime: e.dateTime,
            venue: e.venue
        })).sort((a, b) => b.dateTime.start - a.dateTime.start); // Sort by date desc
    },
});
