import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all notifications for admin
export const getAdminNotifications = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    userType: v.optional(v.string()), // "all", "user", "organiser", "vendor", "speaker", "sponsor"
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    // Start with all notifications
    let notifications = await ctx.db.query("notifications").order("desc").collect();

    // Filter by user type if specified
    if (args.userType && args.userType !== "all") {
      notifications = notifications.filter((n) => n.recipientType === args.userType);
    }

    const paginatedNotifications = notifications.slice(offset, offset + limit);

    // Get sender and recipient details
    const notificationsWithDetails = await Promise.all(
      paginatedNotifications.map(async (notification) => {
        const sender = await ctx.db.get(notification.senderId);
        let recipient = null;
        if (notification.recipientId) {
          recipient = await ctx.db.get(notification.recipientId);
        }

        // Get reply count
        const replies = await ctx.db
          .query("notifications")
          .withIndex("by_parent_id", (q) => q.eq("parentId", notification._id))
          .collect();

        return {
          ...notification,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Admin",
          recipientName: recipient
            ? `${recipient.firstName} ${recipient.lastName}`
            : notification.recipientType === "all"
              ? "All Users"
              : notification.recipientType === "user"
                ? "All End Users"
                : notification.recipientType === "organiser"
                  ? "All Organisers"
                  : notification.recipientType === "vendor"
                    ? "All Vendors"
                    : notification.recipientType === "speaker"
                      ? "All Speakers"
                      : notification.recipientType === "sponsor"
                        ? "All Sponsors"
                        : `All ${notification.recipientType}s`,
          replyCount: replies.length,
        };
      })
    );

    return {
      notifications: notificationsWithDetails,
      total: notifications.length,
      hasMore: offset + limit < notifications.length,
    };
  },
});

// Query to get notification thread (conversation)
export const getNotificationThread = query({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    // Get all replies
    const replies = await ctx.db
      .query("notifications")
      .withIndex("by_parent_id", (q) => q.eq("parentId", args.notificationId))
      .order("asc")
      .collect();

    // Get sender details for all messages
    const thread = await Promise.all(
      [notification, ...replies].map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Unknown",
          senderEmail: sender?.email || "unknown@example.com",
        };
      })
    );

    return thread;
  },
});

// Query to get unread notification count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_is_read", (q) => q.eq("isRead", false))
      .collect();

    // Filter only notifications where admin is the recipient (replies from users)
    const unreadReplies = notifications.filter(
      (n) => n.recipientType === "admin" || n.parentId !== undefined
    );

    return unreadReplies.length;
  },
});

// Mutation to send notification
export const sendNotification = mutation({
  args: {
    recipientType: v.string(), // "all", "user", "organiser", "vendor", "speaker", "sponsor", or "individual"
    recipientId: v.optional(v.id("users")), // For individual notifications
    subject: v.string(),
    message: v.string(),
    priority: v.optional(v.string()), // "low", "normal", "high"
    senderId: v.optional(v.id("users")), // Admin user ID from frontend
  },
  handler: async (ctx, args) => {
    // Get sender user - either from args or find an admin
    let senderUser;
    
    if (args.senderId) {
      senderUser = await ctx.db.get(args.senderId);
    } else {
      // Fallback: find first admin user
      senderUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first();
    }

    if (!senderUser) {
      throw new Error("Admin user not found");
    }

    console.log("📤 Sending notification:", {
      from: `${senderUser.firstName} ${senderUser.lastName}`,
      recipientType: args.recipientType,
      subject: args.subject
    });

    // If sending to all or a specific role, create broadcast notification
    if (args.recipientType !== "individual") {
      const notificationId = await ctx.db.insert("notifications", {
        senderId: senderUser._id,
        recipientId: args.recipientId,
        recipientType: args.recipientType,
        subject: args.subject,
        message: args.message,
        priority: args.priority || "normal",
        isRead: false,
        createdAt: Date.now(),
      });
      
      console.log("✅ Notification created:", notificationId);
    } else {
      // Send to individual user
      if (!args.recipientId) throw new Error("Recipient ID required for individual notifications");

      await ctx.db.insert("notifications", {
        senderId: senderUser._id,
        recipientId: args.recipientId,
        recipientType: "individual",
        subject: args.subject,
        message: args.message,
        priority: args.priority || "normal",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Mutation to reply to notification
export const replyToNotification = mutation({
  args: {
    parentId: v.id("notifications"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const parentNotification = await ctx.db.get(args.parentId);
    if (!parentNotification) throw new Error("Parent notification not found");

    // Get current user (in production, get from auth context)
    const currentUser = await ctx.db.query("users").first(); // Placeholder

    if (!currentUser) throw new Error("User not found");

    // Create reply
    await ctx.db.insert("notifications", {
      senderId: currentUser._id,
      recipientId: parentNotification.senderId, // Reply goes to original sender
      recipientType: "admin",
      subject: `Re: ${parentNotification.subject}`,
      message: args.message,
      priority: parentNotification.priority,
      parentId: args.parentId,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation to mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation to mark all as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_is_read", (q) => q.eq("isRead", false))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt: Date.now(),
        })
      )
    );

    return { success: true, count: unreadNotifications.length };
  },
});

// Mutation to delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    try {
      // First, get all child notifications (replies)
      const childNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_parent_id", (q) => q.eq("parentId", args.notificationId))
        .collect();

      // Delete all child notifications first
      await Promise.all(
        childNotifications.map((child) => ctx.db.delete(child._id))
      );

      // Then delete the parent notification
      await ctx.db.delete(args.notificationId);

      return {
        success: true,
        deletedCount: childNotifications.length + 1
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  },
});

// Query to get notifications for current user
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    // Get user details
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    console.log("🔍 Fetching notifications for user:", {
      userId: args.userId,
      userRole: user.role,
      userName: `${user.firstName} ${user.lastName}`
    });

    // Get notifications for this user
    // Either sent to them individually or sent to their role or to all users
    const allNotifications = await ctx.db.query("notifications").order("desc").collect();

    console.log("📬 Total notifications in database:", allNotifications.length);

    const userNotifications = allNotifications.filter((n) => {
      // Individual notifications
      if (n.recipientId && n.recipientId === args.userId) {
        console.log("✅ Individual notification matched:", n.subject);
        return true;
      }
      
      // Role-based notifications - handle both 'user' and 'attendee' roles
      const userRole = user.role.toLowerCase();
      const recipientType = n.recipientType.toLowerCase();
      
      // Match exact role or if notification is for 'user' and user is 'attendee'
      if (recipientType === userRole || 
          (recipientType === 'user' && userRole === 'attendee') ||
          (recipientType === 'attendee' && userRole === 'user')) {
        console.log("✅ Role-based notification matched:", n.subject, "for role:", recipientType);
        return true;
      }
      
      // Broadcast to all
      if (n.recipientType === "all") {
        console.log("✅ Broadcast notification matched:", n.subject);
        return true;
      }
      
      return false;
    });

    console.log("📨 Filtered notifications for user:", userNotifications.length);

    const paginatedNotifications = userNotifications.slice(offset, offset + limit);

    // Get sender details
    const notificationsWithDetails = await Promise.all(
      paginatedNotifications.map(async (notification) => {
        const sender = await ctx.db.get(notification.senderId);
        return {
          ...notification,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Admin",
          senderEmail: sender?.email || "admin@eventzgo.com",
        };
      })
    );

    return {
      notifications: notificationsWithDetails,
      total: userNotifications.length,
      hasMore: offset + limit < userNotifications.length,
    };
  },
});

// Query to get unread count for current user
export const getUserUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user details
    const user = await ctx.db.get(args.userId);
    if (!user) return 0;

    // Get all notifications
    const allNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_is_read", (q) => q.eq("isRead", false))
      .collect();

    // Filter for this user with improved role matching
    const userUnreadNotifications = allNotifications.filter((n) => {
      if (n.recipientId && n.recipientId === args.userId) return true;
      
      // Role-based matching with case-insensitive comparison
      const userRole = user.role.toLowerCase();
      const recipientType = n.recipientType.toLowerCase();
      
      if (recipientType === userRole || 
          (recipientType === 'user' && userRole === 'attendee') ||
          (recipientType === 'attendee' && userRole === 'user')) return true;
      
      if (n.recipientType === "all") return true;
      return false;
    });

    return userUnreadNotifications.length;
  },
});
