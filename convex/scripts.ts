// Temporary script to update event ticket price to ₹1 for testing
// Run this with: npx convex run scripts:updateTestEventPrice

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import * as bcrypt from "bcryptjs";

export const updateTestEventPrice = mutation({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        // Update the first ticket type to ₹1
        const updatedTicketTypes = event.ticketTypes.map((ticket, index) => {
            if (index === 0) {
                return {
                    ...ticket,
                    price: 1, // Set to ₹1 for testing
                };
            }
            return ticket;
        });

        await ctx.db.patch(args.eventId, {
            ticketTypes: updatedTicketTypes,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: `Updated ${updatedTicketTypes[0].name} ticket to ₹1`,
            event: event.title,
        };
    },
});

export const createAdminUser = mutation({
    args: {},
    handler: async (ctx) => {
        const args = {
            username: "admin@eventzgo.com",
            email: "admin@eventzgo.com",
            password: "AdminEventz2026Secure"
        };

        const existing = await ctx.db
            .query("organisers")
            .withIndex("by_email", (q: any) => q.eq("email", args.email))
            .first();

        const passwordHash = bcrypt.hashSync(args.password, 10);

        if (existing) {
            await ctx.db.patch(existing._id, {
                role: "admin",
                passwordHash: passwordHash,
                accountStatus: "active",
                username: args.username,
            });
            return "Admin updated successfully";
        } else {
            await ctx.db.insert("organisers", {
                username: args.username,
                email: args.email,
                passwordHash: passwordHash,
                role: "admin",
                institutionName: "EventzGo Admin",
                accountStatus: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
                address: {
                    street: "Admin HQ",
                    city: "Admin City",
                    state: "Admin State",
                    pincode: "000000"
                },
                gstNumber: "N/A",
                panNumber: "N/A",
                bankDetails: {
                    accountHolderName: "Admin",
                    accountNumber: "N/A",
                    ifscCode: "N/A",
                    bankName: "N/A",
                    branchName: "N/A"
                },
                documents: {},
                approvalStatus: "approved",
                isActive: true,
            });
            return "Admin created successfully";
        }
    }
});
