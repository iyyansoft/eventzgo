import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create notification
 */
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      metadata: args.metadata,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

/**
 * Get notifications by user
 */
export const getNotificationsByUser = query({
  args: {
    userId: v.id("users"),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc");

    let notifications = await query.collect();

    if (args.unreadOnly) {
      notifications = notifications.filter((n) => !n.isRead);
    }

    if (args.limit) {
      notifications = notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

/**
 * Get unread count
 */
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    return notifications.filter((n) => !n.isRead).length;
  },
});

/**
 * Mark notification as read
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    return args.notificationId;
  },
});

/**
 * Mark all as read
 */
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );

    return notifications.length;
  },
});

/**
 * Delete notification
 */
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

/**
 * Log email
 */
export const logEmail = mutation({
  args: {
    to: v.string(),
    subject: v.string(),
    type: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    provider: v.string(),
    providerId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailLogId = await ctx.db.insert("emailLogs", {
      to: args.to,
      subject: args.subject,
      type: args.type,
      status: args.status,
      provider: args.provider,
      providerId: args.providerId,
      metadata: args.metadata,
      error: args.error,
      createdAt: Date.now(),
    });

    return emailLogId;
  },
});

/**
 * Get email logs
 */
export const getEmailLogs = query({
  args: {
    to: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.union(v.literal("sent"), v.literal("failed"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("emailLogs").order("desc").collect();

    if (args.to) {
      logs = logs.filter((log) => log.to === args.to);
    }

    if (args.type) {
      logs = logs.filter((log) => log.type === args.type);
    }

    if (args.status) {
      logs = logs.filter((log) => log.status === args.status);
    }

    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }

    return logs;
  },
});