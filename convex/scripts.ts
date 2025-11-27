// Temporary script to update event ticket price to ₹1 for testing
// Run this with: npx convex run scripts:updateTestEventPrice

import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
