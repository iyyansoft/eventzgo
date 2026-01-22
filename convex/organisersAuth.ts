import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Trigger rebuild

// Query to list all organisers from the organisers table
export const getAllOrganisers = query({
  args: {},
  handler: async (ctx) => {
    const organisers = await ctx.db.query("organisers").collect();

    return organisers.map((org) => ({
      _id: org._id,
      username: org.username,
      email: org.email,
      institutionName: org.institutionName,
      contactPerson: org.contactPerson,
      phone: org.phone,
      accountStatus: org.accountStatus,
      approvalStatus: org.approvalStatus,
    }));
  },
});

// Mutation to reset password for a specific organiser
export const resetOrganiserPassword = mutation({
  args: {
    organiserId: v.id("organisers"),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.organiserId, {
      passwordHash: args.newPasswordHash,
      requirePasswordChange: false,
      failedLoginAttempts: 0,
      updatedAt: Date.now(),
      passwordChangedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation to reset ALL organiser passwords
export const resetAllOrganiserPasswords = mutation({
  args: {
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const organisers = await ctx.db.query("organisers").collect();

    console.log(`Found ${organisers.length} organisers to reset`);

    const results = [];
    for (const org of organisers) {
      await ctx.db.patch(org._id, {
        passwordHash: args.newPasswordHash,
        requirePasswordChange: false,
        failedLoginAttempts: 0,
        updatedAt: Date.now(),
        passwordChangedAt: Date.now(),
      });

      results.push({
        institutionName: org.institutionName,
        username: org.username,
        email: org.email,
      });

      console.log(`✅ Reset: ${org.institutionName} (${org.username})`);
    }

    return {
      success: true,
      count: organisers.length,
      organisers: results,
    };
  },
});


// Mutation to reset ONLY TicketsHub organiser password
export const resetTicketsHubPassword = mutation({
  args: {
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Find TicketsHub organiser
    const ticketsHub = await ctx.db
      .query("organisers")
      .filter((q) => 
        q.or(
          q.eq(q.field("username"), "ticketshub"),
          q.eq(q.field("institutionName"), "TicketsHub Entertainment")
        )
      )
      .first();

    if (!ticketsHub) {
      throw new Error("TicketsHub organiser not found");
    }

    // Reset password
    await ctx.db.patch(ticketsHub._id, {
      passwordHash: args.newPasswordHash,
      requirePasswordChange: false,
      failedLoginAttempts: 0,
      updatedAt: Date.now(),
      passwordChangedAt: Date.now(),
    });

    console.log(`✅ Reset TicketsHub password: ${ticketsHub.institutionName} (${ticketsHub.username})`);

    return {
      success: true,
      organiser: {
        institutionName: ticketsHub.institutionName,
        username: ticketsHub.username,
        email: ticketsHub.email,
      },
    };
  },
});

