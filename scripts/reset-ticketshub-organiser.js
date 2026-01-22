// scripts/reset-ticketshub-organiser.js
// Reset password for TicketsHub organiser only

const { ConvexHttpClient } = require("convex/browser");
const bcrypt = require("bcryptjs");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function resetTicketsHubOrganiser() {
  try {
    console.log("🔄 Fetching TicketsHub organiser...\n");

    // Get all organisers
    const organisers = await client.query("organisersAuth:getAllOrganisers");

    // Find TicketsHub organiser
    const ticketsHub = organisers.find(
      (org) =>
        org.institutionName?.toLowerCase().includes("ticketshub") ||
        org.username?.toLowerCase().includes("ticketshub")
    );

    if (!ticketsHub) {
      console.log("❌ TicketsHub organiser not found!");
      console.log("\nAvailable organisers:");
      organisers.forEach((org) => {
        console.log(`  - ${org.institutionName} (${org.username})`);
      });
      process.exit(1);
    }

    console.log("✅ Found TicketsHub organiser:");
    console.log(`   Institution: ${ticketsHub.institutionName}`);
    console.log(`   Username: ${ticketsHub.username}`);
    console.log(`   Email: ${ticketsHub.email}\n`);

    // New password
    const newPassword = "Admin@123";
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    console.log("🔄 Resetting password...\n");

    // Reset password
    await client.mutation("organisersAuth:resetOrganiserPassword", {
      organiserId: ticketsHub._id,
      newPasswordHash: hashedPassword,
    });

    console.log("✅ Password reset successful!\n");
    console.log("═══════════════════════════════════════");
    console.log("📋 Login Credentials:");
    console.log("═══════════════════════════════════════");
    console.log(`Institution: ${ticketsHub.institutionName}`);
    console.log(`Username: ${ticketsHub.username}`);
    console.log(`Email: ${ticketsHub.email}`);
    console.log(`Password: ${newPassword}`);
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetTicketsHubOrganiser();
