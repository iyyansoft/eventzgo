// scripts/reset-ticketsgo-organiser.js
// Reset password for TicketsGo organiser only

const { ConvexHttpClient } = require("convex/browser");
const bcrypt = require("bcryptjs");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function resetTicketsGoOrganiser() {
  try {
    console.log("🔄 Fetching TicketsGo organiser...\n");

    // Get all organisers
    const organisers = await client.query("organisersAuth:getAllOrganisers");

    // Find TicketsGo organiser
    const ticketsGo = organisers.find(
      (org) =>
        org.institutionName?.toLowerCase().includes("ticketsgo") ||
        org.username?.toLowerCase().includes("ticketsgo") ||
        org.email?.toLowerCase().includes("ticketsgo")
    );

    if (!ticketsGo) {
      console.log("❌ TicketsGo organiser not found!");
      console.log("\nAvailable organisers:");
      organisers.forEach((org) => {
        console.log(`  - ${org.institutionName} (${org.username})`);
      });
      process.exit(1);
    }

    console.log("✅ Found TicketsGo organiser:");
    console.log(`   Institution: ${ticketsGo.institutionName}`);
    console.log(`   Username: ${ticketsGo.username}`);
    console.log(`   Email: ${ticketsGo.email}\n`);

    // New password
    const newPassword = "Admin@123";
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    console.log("🔄 Resetting password...\n");

    // Reset password
    await client.mutation("organisersAuth:resetOrganiserPassword", {
      organiserId: ticketsGo._id,
      newPasswordHash: hashedPassword,
    });

    console.log("✅ Password reset successful!\n");
    console.log("═══════════════════════════════════════");
    console.log("📋 Login Credentials:");
    console.log("═══════════════════════════════════════");
    console.log(`Institution: ${ticketsGo.institutionName}`);
    console.log(`Username: ${ticketsGo.username}`);
    console.log(`Email: ${ticketsGo.email}`);
    console.log(`Password: ${newPassword}`);
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetTicketsGoOrganiser();
