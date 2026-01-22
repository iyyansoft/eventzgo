// scripts/reset-ticketshub.js
// Simple script to reset TicketsHub organiser password using Convex mutation

const { ConvexHttpClient } = require("convex/browser");
const bcrypt = require("bcryptjs");

const CONVEX_URL = "https://sleek-reindeer-280.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function resetTicketsHub() {
  try {
    const newPassword = "Admin@123";
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    console.log("🔄 Resetting TicketsHub organiser password...\n");

    const result = await client.mutation("organisersAuth:resetTicketsHubPassword", {
      newPasswordHash: hashedPassword,
    });

    if (result.success) {
      console.log("✅ Password reset successful!\n");
      console.log("═══════════════════════════════════════");
      console.log("📋 TicketsHub Login Credentials:");
      console.log("═══════════════════════════════════════");
      console.log(`Institution: ${result.organiser.institutionName}`);
      console.log(`Username: ${result.organiser.username}`);
      console.log(`Email: ${result.organiser.email}`);
      console.log(`Password: ${newPassword}`);
      console.log("═══════════════════════════════════════\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetTicketsHub();
