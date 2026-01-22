/**
 * Reset All Organisers Password Script
 *
 * This script resets the password for ALL organisers in the 'organisers' table.
 * Default password will be set to: Organiser123!
 */

const { ConvexHttpClient } = require("convex/browser");

// Initialize Convex client
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://balanced-seahorse-917.convex.cloud");

// The password to set for all organisers
const NEW_PASSWORD_HASH = "$2a$10$8K1p/a0dL2LkzjkjvS4My.WkojzJ5mylROrYPvnkwVLwEwGoIb2Z2"; // Organiser123!

async function resetPasswords() {
  try {
    console.log("🔐 Starting password reset for ALL organisers...\n");

    const result = await client.mutation("organisersAuth:resetAllOrganiserPasswords", {
      newPasswordHash: NEW_PASSWORD_HASH
    });

    if (result.success) {
      console.log(`✅ Successfully reset passwords for ${result.count} organisers!`);
      console.log("---------------------------------------------------");
      console.log("🔑 New Password for all accounts: Organiser123!");
      console.log("---------------------------------------------------");
      
      if (result.organisers && result.organisers.length > 0) {
        console.log("\n📋 Updated Accounts:");
        result.organisers.forEach((org, i) => {
          console.log(`${i + 1}. ${org.institutionName} (@${org.username})`);
        });
      }
    } else {
      console.log("❌ Failed to reset passwords.");
    }

  } catch (error) {
    console.error("❌ Error executing password reset:", error);
    if (error instanceof Error) {
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
    } else {
        console.error("Unknown error object:", JSON.stringify(error));
    }
    
    if (error.message?.includes("Could not find")) {
      console.log("\n💡 Make sure 'npx convex dev' is running and functions are deployed!");
    }
  }
}

resetPasswords()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
