import { query } from "./_generated/server";

// Get all tables with their record counts
export const getDatabaseStats = query({
    handler: async (ctx) => {
        const tables = [
            "users",
            "organisers",
            "vendors",
            "speakers",
            "sponsors",
            "events",
            "adminNavigation",
        ];

        const stats = await Promise.all(
            tables.map(async (tableName) => {
                const records = await ctx.db.query(tableName as any).collect();
                return {
                    name: tableName,
                    count: records.length,
                };
            })
        );

        return stats;
    },
});

// Get all records from a specific table
export const getTableRecords = query({
    args: {},
    handler: async (ctx) => {
        // Return all tables data
        const users = await ctx.db.query("users").collect();
        const organisers = await ctx.db.query("organisers").collect();
        const vendors = await ctx.db.query("vendors").collect();
        const speakers = await ctx.db.query("speakers").collect();
        const sponsors = await ctx.db.query("sponsors").collect();
        const events = await ctx.db.query("events").collect();
        const adminNavigation = await ctx.db.query("adminNavigation").collect();

        return {
            users,
            organisers,
            vendors,
            speakers,
            sponsors,
            events,
            adminNavigation,
        };
    },
});
