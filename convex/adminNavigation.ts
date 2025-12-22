import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all active navigation items ordered by category and order
export const getNavigationItems = query({
    args: {},
    handler: async (ctx) => {
        const items = await ctx.db
            .query("adminNavigation")
            .withIndex("by_is_active", (q) => q.eq("isActive", true))
            .collect();

        // Sort by category (main first) and then by order
        return items.sort((a, b) => {
            if (a.category !== b.category) {
                return a.category === "main" ? -1 : 1;
            }
            return a.order - b.order;
        });
    },
});

// Mutation to seed initial navigation items
export const seedNavigationItems = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if items already exist
        const existing = await ctx.db.query("adminNavigation").first();
        if (existing) {
            return { success: false, message: "Navigation items already seeded" };
        }

        // Main navigation items
        const mainItems = [
            { label: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard", order: 1 },
            { label: "User Management", path: "/admin/users", icon: "Users", order: 2 },
            { label: "Events", path: "/admin/events", icon: "Calendar", order: 3 },
            { label: "Analytics", path: "/admin/analytics", icon: "BarChart3", order: 4 },
            { label: "System Monitor", path: "/admin/system", icon: "Activity", order: 5 },
            { label: "Database", path: "/admin/database", icon: "Database", order: 6 },
            { label: "Reports", path: "/admin/reports", icon: "FileText", order: 7 },
            { label: "Notifications", path: "/admin/notifications", icon: "Bell", order: 8 },
        ];

        // Bottom navigation items
        const bottomItems = [
            { label: "Settings", path: "/admin/settings", icon: "Settings", order: 1 },
            { label: "Help & Support", path: "/admin/help", icon: "HelpCircle", order: 2 },
        ];

        // Insert main items
        for (const item of mainItems) {
            await ctx.db.insert("adminNavigation", {
                ...item,
                category: "main",
                isActive: true,
            });
        }

        // Insert bottom items
        for (const item of bottomItems) {
            await ctx.db.insert("adminNavigation", {
                ...item,
                category: "bottom",
                isActive: true,
            });
        }

        return { success: true, message: "Navigation items seeded successfully" };
    },
});

// Mutation to update a navigation item
export const updateNavigationItem = mutation({
    args: {
        id: v.id("adminNavigation"),
        label: v.optional(v.string()),
        path: v.optional(v.string()),
        icon: v.optional(v.string()),
        order: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;

        await ctx.db.patch(id, updates);

        return { success: true, message: "Navigation item updated successfully" };
    },
});

// Mutation to toggle navigation item active status
export const toggleNavigationItem = mutation({
    args: {
        id: v.id("adminNavigation"),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item) {
            throw new Error("Navigation item not found");
        }

        await ctx.db.patch(args.id, {
            isActive: !item.isActive,
        });

        return { success: true, message: "Navigation item toggled successfully" };
    },
});

// Mutation to add Management Approval navigation item
export const addManagementApprovalItem = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if it already exists
        const existing = await ctx.db
            .query("adminNavigation")
            .filter((q) => q.eq(q.field("path"), "/admin/approvals"))
            .first();

        if (existing) {
            return { success: false, message: "Management Approval item already exists" };
        }

        await ctx.db.insert("adminNavigation", {
            label: "Management Approval",
            path: "/admin/approvals",
            icon: "UserCheck",
            order: 2.5, // Between User Management and Events
            category: "main",
            isActive: true,
        });

        return { success: true, message: "Management Approval item added successfully" };
    },
});

// Mutation to add Notifications navigation item
export const addNotificationsItem = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if it already exists
        const existing = await ctx.db
            .query("adminNavigation")
            .filter((q) => q.eq(q.field("path"), "/admin/notifications"))
            .first();

        if (existing) {
            return { success: false, message: "Notifications item already exists" };
        }

        await ctx.db.insert("adminNavigation", {
            label: "Notifications",
            path: "/admin/notifications",
            icon: "Bell",
            order: 2.7, // After Management Approval
            category: "main",
            isActive: true,
        });

        return { success: true, message: "Notifications item added successfully" };
    },
});
