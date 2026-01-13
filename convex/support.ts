import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// --- Queries ---

export const getTicketsByOrganiser = query({
    args: {
        organiserId: v.id("organisers"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("supportTickets")
            .withIndex("by_organiser_id", (q) => q.eq("organiserId", args.organiserId))
            .order("desc")
            .collect();
    },
});

export const getTicketDetails = query({
    args: { ticketId: v.id("supportTickets") },
    handler: async (ctx, args) => {
        const ticket = await ctx.db.get(args.ticketId);
        if (!ticket) return null;

        const messages = await ctx.db
            .query("supportMessages")
            .withIndex("by_ticket_id", (q) => q.eq("ticketId", args.ticketId))
            .order("asc") // Oldest first for chat history
            .collect();

        return { ticket, messages };
    },
});

export const getAllTickets = query({
    args: {
        status: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("supportTickets");

        if (args.status) {
            // @ts-ignore
            q = q.withIndex("by_status", (query) => query.eq("status", args.status));
        }

        const tickets = await q.order("desc").collect();

        // Enrich with organiser info
        const ticketsWithInfo = await Promise.all(tickets.map(async (t) => {
            const organiser = await ctx.db.get(t.organiserId);
            return {
                ...t,
                organiserName: organiser?.institutionName || "Unknown",
                organiserEmail: organiser?.email
            };
        }));

        return ticketsWithInfo;
    },
});


// --- Mutations ---

export const createTicket = mutation({
    args: {
        organiserId: v.id("organisers"),
        subject: v.string(),
        description: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const ticketIdVal = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

        const ticketId = await ctx.db.insert("supportTickets", {
            ticketId: ticketIdVal,
            organiserId: args.organiserId,
            subject: args.subject,
            description: args.description,
            category: args.category,
            tags: args.tags,
            priority: args.priority,
            status: "open",
            lastMessageAt: now,
            createdAt: now,
            updatedAt: now,
        });

        // Add initial message (Description)
        await ctx.db.insert("supportMessages", {
            ticketId,
            senderId: args.organiserId,
            senderRole: "organiser",
            message: args.description,
            isRead: true, // Only for sender
            createdAt: now,
        });

        return ticketId;
    },
});

export const sendMessage = mutation({
    args: {
        ticketId: v.id("supportTickets"),
        senderId: v.string(),
        senderRole: v.union(v.literal("organiser"), v.literal("admin")),
        message: v.string(),
        attachments: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        await ctx.db.insert("supportMessages", {
            ticketId: args.ticketId,
            senderId: args.senderId,
            senderRole: args.senderRole,
            message: args.message,
            attachments: args.attachments,
            isRead: false,
            createdAt: now,
        });

        await ctx.db.patch(args.ticketId, {
            lastMessageAt: now,
            updatedAt: now,
            status: args.senderRole === 'admin' ? 'in_progress' : undefined
            // If admin replies, set to in_progress (optionally)
        });
    },
});

export const updateStatus = mutation({
    args: {
        ticketId: v.id("supportTickets"),
        status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ticketId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});
